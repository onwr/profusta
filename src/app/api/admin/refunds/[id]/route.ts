import { RefundStatus } from "@/generated/prisma/client";
import { logAdminAction } from "@/lib/admin/log";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { markOrderCancelled, processRefund } from "@/lib/orders/refund";
import { adminRefundActionSchema } from "@/lib/validations/refund";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { action, refundAmount, adminNote } = adminRefundActionSchema.parse(
      await request.json(),
    );

    const refund = await db.refund.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!refund || refund.status !== RefundStatus.PENDING) {
      return jsonError("İade talebi bulunamadı", 404);
    }

    if (action === "reject") {
      const updated = await db.refund.update({
        where: { id },
        data: {
          status: RefundStatus.REJECTED,
          adminNote: adminNote ?? "Reddedildi",
        },
      });
      await logAdminAction({
        adminId: user!.id,
        action: "refund_reject",
        entityType: "refund",
        entityId: id,
      });
      return jsonSuccess({ refund: updated });
    }

    const amount = refundAmount ?? refund.amount ?? refund.order.amount;
    await processRefund(refund.order, amount);
    await markOrderCancelled(refund.orderId);

    const updated = await db.refund.update({
      where: { id },
      data: {
        status: RefundStatus.APPROVED,
        amount,
        adminNote: adminNote ?? "Onaylandı",
      },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "refund_approve",
      entityType: "refund",
      entityId: id,
      details: String(amount),
    });
    return jsonSuccess({ refund: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
