import { RefundStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const status =
      (new URL(request.url).searchParams.get("status") as RefundStatus) ||
      RefundStatus.PENDING;

    const refunds = await db.refund.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          include: {
            customer: { select: { fullName: true, email: true } },
            provider: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
      },
    });

    return jsonSuccess({ refunds });
  } catch (err) {
    return handleApiError(err);
  }
}
