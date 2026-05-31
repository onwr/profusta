import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { getProviderRating } from "@/lib/reviews/aggregate";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) {
      return jsonSuccess({
        reviews: [],
        summary: {
          ratingAvg: null,
          reviewCount: 0,
          visibleCount: 0,
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          lowStar: 0,
          last30Days: 0,
        },
      });
    }

    const [reviews, rating] = await Promise.all([
      db.review.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
        include: {
          order: { select: { id: true, title: true } },
          customer: { select: { fullName: true, avatarUrl: true } },
        },
      }),
      getProviderRating(provider.id),
    ]);

    const now = Date.now();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const visibleReviews = reviews.filter((r) => r.isVisible);
    const fiveStar = visibleReviews.filter((r) => r.rating === 5).length;
    const fourStar = visibleReviews.filter((r) => r.rating === 4).length;
    const threeStar = visibleReviews.filter((r) => r.rating === 3).length;
    const lowStar = visibleReviews.filter((r) => r.rating <= 2).length;
    const last30Days = reviews.filter(
      (r) => now - r.createdAt.getTime() <= thirtyDaysMs,
    ).length;

    return jsonSuccess({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        isVisible: r.isVisible,
        createdAt: r.createdAt.toISOString(),
        orderId: r.order.id,
        orderTitle: r.order.title,
        authorName: r.customer.fullName,
        authorAvatarUrl: r.customer.avatarUrl,
      })),
      summary: {
        ratingAvg: rating.ratingAvg,
        reviewCount: rating.reviewCount,
        visibleCount: visibleReviews.length,
        fiveStar,
        fourStar,
        threeStar,
        lowStar,
        last30Days,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
