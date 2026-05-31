import {
  BalanceEntryType,
  OrderStatus,
  type Order,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";

const TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  [OrderStatus.PAID_ESCROW]: [OrderStatus.PROVIDER_ACCEPTED],
  [OrderStatus.PROVIDER_ACCEPTED]: [OrderStatus.IN_PROGRESS],
  [OrderStatus.IN_PROGRESS]: [OrderStatus.COMPLETED_BY_PROVIDER],
  [OrderStatus.COMPLETED_BY_PROVIDER]: [OrderStatus.COMPLETED],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export async function transitionOrder(
  order: Order,
  to: OrderStatus,
  extra?: Partial<{ paidAt: Date; completedAt: Date }>,
) {
  if (!canTransition(order.status, to)) {
    return { ok: false as const, error: "Geçersiz durum geçişi", status: 400 };
  }

  const updated = await db.order.update({
    where: { id: order.id },
    data: { status: to, ...extra },
  });
  return { ok: true as const, order: updated };
}

export async function releaseToProviderBalance(order: Order) {
  const existing = await db.providerBalance.findFirst({
    where: { orderId: order.id, type: BalanceEntryType.CREDIT },
  });
  if (existing) return { ok: true as const, alreadyReleased: true };

  await db.$transaction([
    db.providerBalance.create({
      data: {
        providerId: order.providerId,
        orderId: order.id,
        type: BalanceEntryType.CREDIT,
        amount: order.netAmount,
        note: `Sipariş tamamlandı (${order.merchantOid})`,
      },
    }),
    db.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
      },
    }),
  ]);

  return { ok: true as const, alreadyReleased: false };
}

export async function getProviderAvailableBalance(providerId: string) {
  const entries = await db.providerBalance.findMany({
    where: { providerId },
  });
  const credits = entries
    .filter((e) => e.type === BalanceEntryType.CREDIT)
    .reduce((s, e) => s + e.amount, 0);
  const debits = entries
    .filter((e) => e.type === BalanceEntryType.DEBIT || e.type === BalanceEntryType.PAYOUT)
    .reduce((s, e) => s + e.amount, 0);
  return Math.round((credits - debits) * 100) / 100;
}
