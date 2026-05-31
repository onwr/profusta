import { OrderStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getOrderForUser } from "@/lib/orders/access";
import { resolveDisputeOnCustomerAccept } from "@/lib/orders/disputes";
import { releaseToProviderBalance } from "@/lib/orders/transitions";
import { serializeOrder } from "@/lib/orders/serialize";
import { db } from "@/lib/db";
import { notifyOrderUpdate } from "@/lib/notifications/create";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    if (result.order.status !== OrderStatus.COMPLETED_BY_PROVIDER) {
      return jsonError("Sipariş henüz usta tarafından tamamlanmadı", 400);
    }

    await db.$transaction(async (tx) => {
      await resolveDisputeOnCustomerAccept(tx, id, user!.id);
    });

    const release = await releaseToProviderBalance(result.order);
    if (!release.ok) return jsonError("İşlem başarısız", 500);

    const order = await db.order.findUnique({ where: { id } });
    const providerUser = await db.provider.findUnique({
      where: { id: result.order.providerId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (providerUser) {
      await notifyOrderUpdate({
        userId: providerUser.user.id,
        email: providerUser.user.email,
        title: "Sipariş onaylandı",
        body: "Müşteri işi onayladı. Bakiyenize aktarıldı.",
        orderTitle: result.order.title,
        link: `${appUrl()}/usta/isler/${id}`,
      });
    }
    return jsonSuccess({
      order: order ? serializeOrder(order) : null,
      message: "İş onaylandı, usta bakiyesine aktarıldı",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
