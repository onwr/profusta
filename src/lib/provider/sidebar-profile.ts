import { db } from "@/lib/db";
import { getProviderRating } from "@/lib/reviews/aggregate";

export async function getProviderSidebarProfile(
  providerId: string,
  fallbackName: string,
) {
  const provider = await db.provider.findUnique({
    where: { id: providerId },
    include: {
      categories: { take: 1 },
      user: { select: { fullName: true, avatarUrl: true } },
    },
  });

  let profession = "Usta";
  if (provider?.categories[0]) {
    const cat = await db.category.findFirst({
      where: { slug: provider.categories[0].categorySlug },
      select: { name: true },
    });
    if (cat) profession = cat.name;
  }

  const rating = await getProviderRating(providerId);

  return {
    fullName: provider?.user.fullName ?? fallbackName,
    avatarUrl: provider?.user.avatarUrl ?? null,
    profession,
    ratingAvg: rating.ratingAvg,
    reviewCount: rating.reviewCount,
  };
}
