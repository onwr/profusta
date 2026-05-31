import { BalanceEntryType, PayoutStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { getProviderAvailableBalance } from "@/lib/orders/transitions";
import { db } from "@/lib/db";

const ACTIVE_ORDER_STATUSES = [
  "PAID_ESCROW",
  "PROVIDER_ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED_BY_PROVIDER",
] as const;

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) {
      return jsonSuccess({
        wallet: {
          available: 0,
          pending: 0,
          totalEarned: 0,
          withdrawn: 0,
        },
        entries: [],
        earningsByDay: [],
      });
    }

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - 6);

    const [
      available,
      credits,
      paidPayouts,
      pendingOrders,
      balanceEntries,
      weekCredits,
    ] = await Promise.all([
      getProviderAvailableBalance(provider.id),
      db.providerBalance.findMany({
        where: { providerId: provider.id, type: BalanceEntryType.CREDIT },
        select: { amount: true },
      }),
      db.payout.findMany({
        where: { providerId: provider.id, status: PayoutStatus.PAID },
        select: { amount: true },
      }),
      db.order.findMany({
        where: { providerId: provider.id, status: { in: [...ACTIVE_ORDER_STATUSES] } },
        select: { netAmount: true },
      }),
      db.providerBalance.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          order: { select: { id: true, title: true } },
        },
      }),
      db.providerBalance.findMany({
        where: {
          providerId: provider.id,
          type: BalanceEntryType.CREDIT,
          createdAt: { gte: weekStart },
        },
        select: { amount: true, createdAt: true },
      }),
    ]);

    const totalEarned = credits.reduce((s, e) => s + e.amount, 0);
    const withdrawn = paidPayouts.reduce((s, p) => s + p.amount, 0);
    const pending = pendingOrders.reduce((s, o) => s + o.netAmount, 0);

    const earningsByDay: { label: string; amount: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      const key = d.getTime();
      let amount = 0;
      for (const e of weekCredits) {
        const ed = new Date(e.createdAt);
        ed.setHours(0, 0, 0, 0);
        if (ed.getTime() === key) amount += e.amount;
      }
      earningsByDay.push({
        label: d.toLocaleDateString("tr-TR", { weekday: "short" }),
        amount: Math.round(amount * 100) / 100,
      });
    }

    const entries = balanceEntries.map((e) => ({
      id: e.id,
      type: e.type,
      amount: e.amount,
      note: e.note,
      createdAt: e.createdAt.toISOString(),
      orderId: e.order?.id ?? null,
      orderTitle: e.order?.title ?? null,
    }));

    return jsonSuccess({
      wallet: {
        available: Math.round(available * 100) / 100,
        pending: Math.round(pending * 100) / 100,
        totalEarned: Math.round(totalEarned * 100) / 100,
        withdrawn: Math.round(withdrawn * 100) / 100,
      },
      entries,
      earningsByDay,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
