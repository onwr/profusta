import {
  MessageType,
  OrderSourceType,
  PrivateOfferStatus,
} from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getConversationForUser } from "@/lib/conversations/access";
import { createOrderFromSource } from "@/lib/orders/create";
import { paymentUrlForOrder } from "@/lib/orders/payment-url";
import { db } from "@/lib/db";
import { privateOfferActionSchema } from "@/lib/validations/conversation";

type Params = { params: Promise<{ id: string; offerId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id, offerId } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Konuşma bulunamadı", 404);
    }

    const { action } = privateOfferActionSchema.parse(await request.json());

    const offer = await db.privateOffer.findFirst({
      where: { id: offerId, conversationId: id, status: PrivateOfferStatus.PENDING },
    });
    if (!offer) return jsonError("Teklif bulunamadı", 404);

    const newStatus =
      action === "accept"
        ? PrivateOfferStatus.ACCEPTED
        : PrivateOfferStatus.REJECTED;

    await db.privateOffer.update({
      where: { id: offerId },
      data: { status: newStatus },
    });

    let paymentUrl: string | undefined;
    let orderId: string | undefined;

    if (action === "accept") {
      const orderResult = await createOrderFromSource({
        customerId: user!.id,
        sourceType: OrderSourceType.PRIVATE_OFFER,
        sourceId: offerId,
      });
      if (!orderResult.ok) {
        return jsonError(orderResult.error, orderResult.status);
      }
      orderId = orderResult.order.id;
      paymentUrl = paymentUrlForOrder(orderResult.order.id);

      await db.message.create({
        data: {
          conversationId: id,
          senderId: user!.id,
          type: MessageType.TEXT,
          body: "Özel teklifi kabul ettiniz. Ödeme sayfasına yönlendirilebilirsiniz.",
        },
      });
      await db.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      });
    }

    return jsonSuccess({
      offer: { id: offerId, status: newStatus },
      orderId,
      paymentUrl,
      message:
        action === "accept"
          ? "Teklif kabul edildi. Ödemeye yönlendiriliyorsunuz."
          : "Teklif reddedildi",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
