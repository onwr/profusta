import { OrderSourceType } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { acceptOffer } from "@/lib/offers/rules";
import { createOrderFromSource } from "@/lib/orders/create";
import { paymentUrlForOrder } from "@/lib/orders/payment-url";

type Params = { params: Promise<{ id: string; offerId: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id, offerId } = await params;
    const result = await acceptOffer(id, offerId, user!.id);
    if (!result.ok) return jsonError(result.error, result.status);

    const orderResult = await createOrderFromSource({
      customerId: user!.id,
      sourceType: OrderSourceType.REQUEST_OFFER,
      sourceId: offerId,
    });
    if (!orderResult.ok) {
      return jsonError(orderResult.error, orderResult.status);
    }

    return jsonSuccess({
      message: "Teklif kabul edildi. Ödemeye yönlendiriliyorsunuz.",
      offer: result.offer,
      orderId: orderResult.order.id,
      paymentUrl: paymentUrlForOrder(orderResult.order.id),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
