import {
  OrderStatus,
  RefundRequestedBy,
  RefundScenario,
  RefundStatus,
} from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { canProviderCancel } from "@/lib/orders/cancel-rules";
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
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isProvider) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const check = canProviderCancel(result.order);
    if (!check.ok) return jsonError(check.error!, 400);

    const { reason } = cancelOrderSchema.parse(await request.json());

    await db.$transaction([
      db.provider.update({
        where: { id: result.order.providerId },
        data: { cancelCount: { increment: 1 } },
      }),
      db.refund.create({
        data: {
          orderId: id,
          requestedBy: RefundRequestedBy.PROVIDER,
          scenario: RefundScenario.PROVIDER_CANCEL,
          reason,
          amount: result.order.amount,
          status: RefundStatus.APPROVED,
          adminNote: "Usta iptali — otomatik tam iade",
        },
      }),
    ]);

    await processRefund(result.order);
    await markOrderCancelled(id);

    return jsonSuccess({
      message: "İş iptal edildi, müşteriye tam iade kaydedildi",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
