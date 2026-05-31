import { getProviderRating } from "@/lib/reviews/aggregate";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const provider = await db.provider.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!provider) {
      return jsonSuccess({ reviews: [], ratingAvg: null, reviewCount: 0 });
    }

    const [rating, reviews] = await Promise.all([
      getProviderRating(id),
      db.review.findMany({
        where: { providerId: id, isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          customer: { select: { fullName: true } },
          order: { select: { title: true } },
        },
      }),
    ]);

    return jsonSuccess({
      ...rating,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        customerName: r.customer.fullName,
        orderTitle: r.order.title,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
