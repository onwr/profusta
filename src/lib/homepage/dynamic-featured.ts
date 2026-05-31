import { ListingStatus } from "@/generated/prisma/client";
import { ROUTES } from "@/lib/constants";
import { db } from "@/lib/db";
import type { HomepageItemData } from "@/lib/homepage/defaults";

/** Anasayfa popüler hizmet kartları — aktif kategorilerden otomatik üretilir. */
export async function buildDynamicFeaturedServices(
  limit: number,
): Promise<HomepageItemData[]> {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      description: true,
      coverImageUrl: true,
      sortOrder: true,
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { id: true, slug: true, name: true },
      },
      _count: {
        select: {
          listings: { where: { status: ListingStatus.ACTIVE } },
        },
      },
    },
  });

  const ranked = [...categories].sort((a, b) => {
    const aScore =
      (a.coverImageUrl ? 100 : 0) +
      (a._count.listings > 0 ? 20 : 0) +
      (a.services.length > 0 ? 10 : 0);
    const bScore =
      (b.coverImageUrl ? 100 : 0) +
      (b._count.listings > 0 ? 20 : 0) +
      (b.services.length > 0 ? 10 : 0);
    if (bScore !== aScore) return bScore - aScore;
    return a.sortOrder - b.sortOrder;
  });

  return ranked.slice(0, Math.max(1, limit)).map((cat, index) => {
    const primaryService = cat.services[0];
    const href = primaryService
      ? `${ROUTES.categories}/${cat.slug}?hizmet=${primaryService.slug}`
      : `${ROUTES.categories}/${cat.slug}`;

    return {
      id: `dynamic-category-${cat.id}`,
      type: "FEATURED_SERVICE" as const,
      sortOrder: index,
      isActive: true,
      title: cat.name,
      subtitle: null,
      description:
        cat.description?.trim() ||
        "Kategoriye göz atın ve talep oluşturun.",
      body: null,
      priceLabel: null,
      icon: cat.icon,
      href,
      stepNumber: null,
      bullets: null,
      rating: null,
      serviceId: primaryService?.id ?? null,
      listingId: null,
      imageUrl: cat.coverImageUrl,
    };
  });
}

export async function countCmsFeaturedServices(): Promise<number> {
  return db.homepageItem.count({
    where: { type: "FEATURED_SERVICE", isActive: true },
  });
}
