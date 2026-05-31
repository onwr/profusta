import { ListingStatus } from "@/generated/prisma/client";
import { categorySlugFromHref } from "@/lib/categories/resolve-cover";
import { db } from "@/lib/db";
import type { HomepageConfigData, HomepageItemData } from "@/lib/homepage/defaults";
import { buildDynamicFeaturedServices } from "@/lib/homepage/dynamic-featured";

function nameKey(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

/** Eski seed / hayalet kartları eler; yalnızca DB’de karşılığı olan manuel kartlar kalır. */
async function filterValidManualFeatured(
  items: HomepageItemData[],
): Promise<HomepageItemData[]> {
  if (items.length === 0) return [];

  const [categories, services, listings] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
    }),
    db.service.findMany({
      where: { isActive: true, category: { isActive: true } },
      select: { id: true, name: true },
    }),
    db.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      select: { id: true },
    }),
  ]);

  const categorySlugs = new Set(categories.map((c) => c.slug));
  const categoryNames = new Set(categories.map((c) => nameKey(c.name)));
  const serviceIds = new Set(services.map((s) => s.id));
  const serviceNames = new Set(services.map((s) => nameKey(s.name)));
  const listingIds = new Set(listings.map((l) => l.id));

  return items.filter((item) => {
    if (item.listingId && listingIds.has(item.listingId)) return true;
    if (item.serviceId && serviceIds.has(item.serviceId)) return true;

    const slug = categorySlugFromHref(item.href);
    if (slug && categorySlugs.has(slug)) return true;

    const title = item.title?.trim();
    if (title) {
      if (categoryNames.has(nameKey(title))) return true;
      if (serviceNames.has(nameKey(title))) return true;
    }

    return false;
  });
}

/**
 * Anasayfa popüler hizmetler: varsayılan olarak aktif kategorilerden üretilir.
 * CMS’de yalnızca geçerli (ilan/hizmet/kategori ile eşleşen) manuel kart varsa onlar kullanılır.
 */
export async function resolveFeaturedServiceItems(
  config: HomepageConfigData,
  allItems: HomepageItemData[],
): Promise<HomepageItemData[]> {
  const limit = config.popularServicesLimit || config.categoriesLimit || 8;

  const cmsFeatured = allItems
    .filter((i) => i.type === "FEATURED_SERVICE" && i.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const validManual = await filterValidManualFeatured(cmsFeatured);
  if (validManual.length > 0) {
    return validManual.slice(0, limit);
  }

  return buildDynamicFeaturedServices(limit);
}
