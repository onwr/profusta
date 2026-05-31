import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const payments = await db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        order: {
          select: {
            id: true,
            merchantOid: true,
            title: true,
            amount: true,
            status: true,
          },
        },
      },
    });

    return jsonSuccess({
      payments: payments.map((p) => ({
        id: p.id,
        orderId: p.orderId,
        merchantOid: p.merchantOid,
        status: p.status,
        totalAmountKurus: p.totalAmountKurus,
        failedReason: p.failedReason,
        createdAt: p.createdAt.toISOString(),
        order: p.order,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
