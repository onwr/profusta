import { DisputeStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const statusParam = new URL(request.url).searchParams.get("status");
    const status = (statusParam as DisputeStatus) || DisputeStatus.OPEN;

    const disputes = await db.dispute.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        order: {
          include: {
            customer: { select: { fullName: true } },
            provider: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
        customer: { select: { fullName: true, email: true } },
      },
    });

    return jsonSuccess({ disputes });
  } catch (err) {
    return handleApiError(err);
  }
}
