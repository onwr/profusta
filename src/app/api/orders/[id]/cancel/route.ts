import {
  RefundRequestedBy,
  RefundStatus,
} from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { evaluateCustomerCancel } from "@/lib/orders/cancel-rules";
import { getOrderForUser } from "@/lib/orders/access";
import {
  createRefundRecord,
  markOrderCancelled,
  processRefund,
} from "@/lib/orders/refund";
import { cancelOrderSchema } from "@/lib/validations/refund";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const { reason } = cancelOrderSchema.parse(await request.json());
    const evaluation = evaluateCustomerCancel(result.order);
    if (evaluation.error) return jsonError(evaluation.error, 400);

    if (evaluation.autoRefund) {
      await createRefundRecord({
        orderId: id,
        requestedBy: RefundRequestedBy.CUSTOMER,
        scenario: evaluation.scenario,
        reason,
        amount: result.order.amount,
        status: RefundStatus.APPROVED,
        adminNote: "Otomatik tam iade (usta kabul etmedi)",
      });
      await processRefund(result.order);
      await markOrderCancelled(id);
      return jsonSuccess({
        message: "Sipariş iptal edildi ve tam iade işlendi",
        autoRefund: true,
      });
    }

    const refund = await createRefundRecord({
      orderId: id,
      requestedBy: RefundRequestedBy.CUSTOMER,
      scenario: evaluation.scenario,
      reason,
      amount: result.order.amount,
    });

    return jsonSuccess({
      message: "İptal talebiniz admin incelemesine gönderildi",
      refund,
      autoRefund: false,
    }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
