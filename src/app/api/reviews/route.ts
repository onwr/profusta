import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const isProvider = user!.role === "PROVIDER" && user!.provider;

    const reviews = await db.review.findMany({
      where: isProvider
        ? { providerId: user!.provider!.id }
        : { customerId: user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        order: { select: { title: true, merchantOid: true } },
        customer: { select: { fullName: true } },
        provider: {
          include: { user: { select: { fullName: true } } },
        },
      },
    });

    return jsonSuccess({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVisible: r.isVisible,
        createdAt: r.createdAt.toISOString(),
        orderTitle: r.order.title,
        authorName: isProvider ? r.customer.fullName : r.provider.user.fullName,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
