import { ListingStatus, ProviderStatus } from "@/generated/prisma/client";
import { requireCustomer, requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getOtherPartyName } from "@/lib/conversations/access";
import { db } from "@/lib/db";
import { getProviderConversationStats } from "@/lib/providers/conversation-stats";
import { createConversationSchema } from "@/lib/validations/conversation";

export async function GET() {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const isProvider = user!.role === "PROVIDER" && user!.provider;

    const conversations = await db.conversation.findMany({
      where: isProvider
        ? { providerId: user!.provider!.id }
        : { customerId: user!.id },
      orderBy: { lastMessageAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
        provider: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            city: true,
            district: true,
            createdAt: true,
          },
        },
        privateOffers: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            price: true,
            title: true,
            createdAt: true,
            scheduledAt: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            body: true,
            type: true,
            senderId: true,
            createdAt: true,
            readAt: true,
          },
        },
      },
    });

    const items = await Promise.all(
      conversations.map(async (c) => {
        const last = c.messages[0];
        const otherUserId = isProvider ? c.customer.id : c.provider.user.id;
        const unreadCount = await db.message.count({
          where: {
            conversationId: c.id,
            senderId: otherUserId,
            readAt: null,
          },
        });

        const otherProviderStats = !isProvider
          ? await getProviderConversationStats(c.providerId)
          : null;

        return {
          id: c.id,
          listing: c.listing
            ? {
                ...c.listing,
                createdAt: c.listing.createdAt.toISOString(),
              }
            : null,
          otherName: getOtherPartyName(c, !isProvider),
          otherAvatarUrl: isProvider ? c.customer.avatarUrl : c.provider.user.avatarUrl,
          otherProviderStats,
          latestOffer: c.privateOffers[0]
            ? {
                ...c.privateOffers[0],
                createdAt: c.privateOffers[0].createdAt.toISOString(),
                scheduledAt: c.privateOffers[0].scheduledAt?.toISOString() ?? null,
              }
            : null,
          lastMessage: last
            ? {
                body:
                  last.type === "PRIVATE_OFFER"
                    ? "Özel teklif gönderildi"
                    : last.type === "IMAGE"
                      ? "Bir fotoğraf gönderildi"
                      : last.body,
                createdAt: last.createdAt.toISOString(),
                isMine: last.senderId === user!.id,
                readAt: last.readAt?.toISOString() ?? null,
              }
            : null,
          unreadCount,
          lastMessageAt: c.lastMessageAt?.toISOString() ?? null,
        };
      }),
    );

    return jsonSuccess({ conversations: items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const body = createConversationSchema.parse(await request.json());

    const provider = await db.provider.findFirst({
      where: { id: body.providerId, status: ProviderStatus.APPROVED },
    });
    if (!provider) return jsonError("Usta bulunamadı", 404);

    if (body.listingId) {
      const listing = await db.listing.findFirst({
        where: {
          id: body.listingId,
          providerId: provider.id,
          status: ListingStatus.ACTIVE,
        },
      });
      if (!listing) return jsonError("İlan bulunamadı", 404);
    }

    const conversation = await db.conversation.upsert({
      where: {
        customerId_providerId: {
          customerId: user!.id,
          providerId: provider.id,
        },
      },
      create: {
        customerId: user!.id,
        providerId: provider.id,
        listingId: body.listingId ?? null,
      },
      update: body.listingId ? { listingId: body.listingId } : {},
      include: {
        provider: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    return jsonSuccess({ conversation: { id: conversation.id } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
