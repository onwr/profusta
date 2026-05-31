import {
  DisputeActorRole,
  DisputeEventType,
  DisputePhase,
  DisputeStatus,
  OrderStatus,
} from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { appendDisputeEvent } from "@/lib/orders/disputes";
import { processRefund } from "@/lib/orders/refund";
import { releaseToProviderBalance } from "@/lib/orders/transitions";
import { adminDisputeActionSchema } from "@/lib/validations/dispute";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = adminDisputeActionSchema.parse(await request.json());

    const dispute = await db.dispute.findUnique({
      where: { id },
      include: { order: true },
    });
    if (!dispute || dispute.status !== DisputeStatus.OPEN) {
      return jsonError("İtiraz bulunamadı", 404);
    }

    const note =
      body.adminNote?.trim() ||
      `Admin kararı: ${body.action}`;

    if (body.action === "reject") {
      const updated = await db.$transaction(async (tx) => {
        await appendDisputeEvent(tx, {
          disputeId: id,
          type: DisputeEventType.ADMIN_REJECTED,
          message: note,
          actor: { role: DisputeActorRole.ADMIN, id: user!.id },
        });
        const d = await tx.dispute.update({
          where: { id },
          data: {
            status: DisputeStatus.REJECTED,
            phase: DisputePhase.CLOSED,
            adminDecision: "reject",
            resolvedAt: new Date(),
          },
        });
        if (dispute.order.status === OrderStatus.DISPUTED) {
          await tx.order.update({
            where: { id: dispute.orderId },
            data: {
              status: dispute.order.providerCompletedAt
                ? OrderStatus.COMPLETED_BY_PROVIDER
                : OrderStatus.COMPLETED,
            },
          });
        }
        return d;
      });
      return jsonSuccess({ dispute: updated });
    }

    const updated = await db.$transaction(async (tx) => {
      if (body.action === "full_refund") {
        await processRefund(dispute.order);
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.REFUNDED },
        });
      } else if (body.action === "partial_refund") {
        const amt = body.refundAmount;
        if (!amt) throw new Error("Kısmi iade tutarı gerekli");
        await processRefund(dispute.order, amt);
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.REFUNDED },
        });
      } else if (body.action === "release_to_provider") {
        if (dispute.order.status !== OrderStatus.COMPLETED) {
          await releaseToProviderBalance(dispute.order);
        }
        await tx.order.update({
          where: { id: dispute.orderId },
          data: { status: OrderStatus.COMPLETED },
        });
      }

      await appendDisputeEvent(tx, {
        disputeId: id,
        type: DisputeEventType.ADMIN_RESOLVED,
        message: note,
        actor: { role: DisputeActorRole.ADMIN, id: user!.id },
      });

      return tx.dispute.update({
        where: { id },
        data: {
          status: DisputeStatus.RESOLVED,
          phase: DisputePhase.CLOSED,
          adminDecision: body.action,
          refundAmount: body.refundAmount ?? dispute.order.amount,
          resolvedAt: new Date(),
        },
      });
    });

    return jsonSuccess({ dispute: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "Kısmi iade tutarı gerekli") {
      return jsonError(err.message, 400);
    }
    return handleApiError(err);
  }
}
