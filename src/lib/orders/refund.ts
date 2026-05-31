import {
  BalanceEntryType,
  OrderStatus,
  RefundStatus,
  type Order,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function processRefund(
  order: Order,
  refundAmount?: number,
) {
  const amount = refundAmount ?? order.amount;

  const credit = await db.providerBalance.findFirst({
    where: { orderId: order.id, type: BalanceEntryType.CREDIT },
  });

  await db.$transaction(async (tx) => {
    if (credit) {
      await tx.providerBalance.create({
        data: {
          providerId: order.providerId,
          orderId: order.id,
          type: BalanceEntryType.DEBIT,
          amount: credit.amount,
          note: `İade — sipariş ${order.merchantOid}`,
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.REFUNDED,
        completedAt: order.completedAt ?? new Date(),
      },
    });
  });

  return { ok: true as const, amount };
}

export async function markOrderCancelled(orderId: string) {
  await db.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.CANCELLED },
  });
}

export async function createRefundRecord(params: {
  orderId: string;
  requestedBy: "CUSTOMER" | "PROVIDER";
  scenario: import("@/generated/prisma/client").RefundScenario;
  reason: string;
  amount?: number;
  status?: RefundStatus;
  adminNote?: string;
}) {
  return db.refund.create({
    data: {
      orderId: params.orderId,
      requestedBy: params.requestedBy,
      scenario: params.scenario,
      reason: params.reason,
      amount: params.amount,
      status: params.status ?? RefundStatus.PENDING,
      adminNote: params.adminNote,
    },
  });
}
