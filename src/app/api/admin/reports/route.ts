import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const [
      users,
      providers,
      requests,
      offers,
      orders,
      paymentsSuccess,
      revenue,
      openDisputes,
      pendingRefunds,
    ] = await Promise.all([
      db.user.count(),
      db.provider.count({ where: { status: "APPROVED" } }),
      db.serviceRequest.count(),
      db.offer.count(),
      db.order.count(),
      db.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
      db.order.aggregate({
        where: { status: { in: [OrderStatus.COMPLETED, OrderStatus.PAYOUT_COMPLETED] } },
        _sum: { amount: true, commissionAmount: true },
      }),
      db.dispute.count({ where: { status: "OPEN" } }),
      db.refund.count({ where: { status: "PENDING" } }),
    ]);

    const last30 = new Date();
    last30.setDate(last30.getDate() - 30);

    const ordersLast30 = await db.order.count({
      where: { createdAt: { gte: last30 } },
    });

    return jsonSuccess({
      reports: {
        users,
        providers,
        requests,
        offers,
        orders,
        paymentsSuccess,
        ordersLast30,
        revenueTotal: revenue._sum.amount ?? 0,
        commissionTotal: revenue._sum.commissionAmount ?? 0,
        openDisputes,
        pendingRefunds,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
