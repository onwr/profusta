import { db } from "@/lib/db";

export async function getProviderRating(providerId: string) {
  const reviews = await db.review.findMany({
    where: { providerId, isVisible: true },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    return { ratingAvg: null as number | null, reviewCount: 0 };
  }

  const sum = reviews.reduce((s, r) => s + r.rating, 0);
  const ratingAvg = Math.round((sum / reviews.length) * 10) / 10;
  return { ratingAvg, reviewCount: reviews.length };
}
