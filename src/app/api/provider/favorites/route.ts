import { OrderStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) {
      return jsonSuccess({ favorites: [], summary: { total: 0, withConversation: 0 } });
    }

    const favorites = await db.favorite.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
      },
    });

    const items = await Promise.all(
      favorites.map(async (f) => {
        const [conversation, completedOrders] = await Promise.all([
          db.conversation.findUnique({
            where: {
              customerId_providerId: {
                customerId: f.customerId,
                providerId: provider.id,
              },
            },
            select: { id: true },
          }),
          db.order.count({
            where: {
              providerId: provider.id,
              customerId: f.customerId,
              status: OrderStatus.COMPLETED,
            },
          }),
        ]);

        return {
          id: f.id,
          customerId: f.customerId,
          fullName: f.customer.fullName,
          avatarUrl: f.customer.avatarUrl,
          conversationId: conversation?.id ?? null,
          completedOrders,
          createdAt: f.createdAt.toISOString(),
        };
      }),
    );

    return jsonSuccess({
      favorites: items,
      summary: {
        total: items.length,
        withConversation: items.filter((i) => i.conversationId).length,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
