import type { Dispute, Order, Payment } from "@/generated/prisma/client";

type OrderWithRelations = Order & {
  customer?: { fullName: string; email: string };
  provider?: { user: { fullName: string } };
  payments?: Payment[];
  disputes?: Pick<Dispute, "description" | "status" | "phase">[];
};

export function serializeOrder(o: OrderWithRelations) {
  return {
    id: o.id,
    merchantOid: o.merchantOid,
    title: o.title,
    description: o.description,
    amount: o.amount,
    commissionRate: o.commissionRate,
    commissionAmount: o.commissionAmount,
    netAmount: o.netAmount,
    status: o.status,
    sourceType: o.sourceType,
    sourceId: o.sourceId,
    paidAt: o.paidAt?.toISOString() ?? null,
    completedAt: o.completedAt?.toISOString() ?? null,
    createdAt: o.createdAt.toISOString(),
    customerName: o.customer?.fullName,
    providerName: o.provider?.user.fullName,
    lastPayment: o.payments?.[0]
      ? {
          status: o.payments[0].status,
          totalAmountKurus: o.payments[0].totalAmountKurus,
        }
      : null,
    latestDispute: o.disputes?.[0]
      ? {
          description: o.disputes[0].description,
          status: o.disputes[0].status,
          phase: o.disputes[0].phase,
        }
      : null,
  };
}
