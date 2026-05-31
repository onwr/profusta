import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const reviews = await db.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: { select: { fullName: true } },
        provider: {
          include: { user: { select: { fullName: true } } },
        },
        order: { select: { title: true } },
      },
    });

    return jsonSuccess({ reviews });
  } catch (err) {
    return handleApiError(err);
  }
}
