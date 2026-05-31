import { OrderStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { getOrderForUser } from "@/lib/orders/access";
import { transitionOrder } from "@/lib/orders/transitions";
import { notifyOrderUpdate } from "@/lib/notifications/create";
import { serializeOrder } from "@/lib/orders/serialize";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isProvider) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const tr = await transitionOrder(
      result.order,
      OrderStatus.COMPLETED_BY_PROVIDER,
    );
    if (!tr.ok) return jsonError(tr.error, tr.status);

    const updated = await db.order.update({
      where: { id },
      data: { providerCompletedAt: new Date() },
    });

    const withCustomer = await db.order.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, email: true, fullName: true } },
      },
    });
    if (withCustomer) {
      await notifyOrderUpdate({
        userId: withCustomer.customer.id,
        email: withCustomer.customer.email,
        title: "İş tamamlandı",
        body: "Usta işi tamamladı. Lütfen onaylayın veya 48 saat içinde otomatik onaylanacaktır.",
        orderTitle: withCustomer.title,
        link: `${appUrl()}/musteri/siparisler/${id}`,
      });
    }

    return jsonSuccess({ order: serializeOrder(updated) });
  } catch (err) {
    return handleApiError(err);
  }
}
