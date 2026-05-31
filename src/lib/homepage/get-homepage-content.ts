import type { HomepageItemType } from "@/generated/prisma/client";
import { getActiveCategories } from "@/lib/categories";
import { enrichFeaturedServices } from "@/lib/homepage/enrich-featured";
import {
  buildDynamicFeaturedServices,
} from "@/lib/homepage/dynamic-featured";
import { resolveFeaturedServiceItems } from "@/lib/homepage/resolve-featured";
import { db } from "@/lib/db";
import {
  DEFAULT_HOMEPAGE_CONFIG,
  DEFAULT_HOMEPAGE_ITEMS,
  type HomepageConfigData,
  type HomepageItemData,
} from "@/lib/homepage/defaults";

function mapItem(
  row: {
    id: string;
    type: HomepageItemType;
    sortOrder: number;
    isActive: boolean;
    title: string | null;
    subtitle: string | null;
    description: string | null;
    body: string | null;
    priceLabel: string | null;
    icon: string | null;
    href: string | null;
    stepNumber: string | null;
    bullets: unknown;
    rating: number | null;
    serviceId: string | null;
    listingId: string | null;
    imageUrl: string | null;
  },
): HomepageItemData {
  const bullets = Array.isArray(row.bullets)
    ? (row.bullets as string[])
    : null;
  return {
    id: row.id,
    type: row.type,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    body: row.body,
    priceLabel: row.priceLabel,
    icon: row.icon,
    href: row.href,
    stepNumber: row.stepNumber,
    bullets,
    rating: row.rating,
    serviceId: row.serviceId,
    listingId: row.listingId,
    imageUrl: row.imageUrl,
  };
}

function mapDefaultItems(): HomepageItemData[] {
  return DEFAULT_HOMEPAGE_ITEMS.map((item, i) => ({
    ...item,
    id: `default-${i}`,
    serviceId: null,
    listingId: null,
    imageUrl: null,
  }));
}

function activeByType(items: HomepageItemData[], type: HomepageItemType) {
  return items
    .filter((i) => i.type === type && i.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getHomepageConfigForAdmin(): Promise<HomepageConfigData> {
  const row = await db.homepageConfig.findUnique({ where: { id: "default" } });
  if (!row) return DEFAULT_HOMEPAGE_CONFIG;
  const typed = row as HomepageConfigData;
  return {
    ...DEFAULT_HOMEPAGE_CONFIG,
    ...typed,
    popularServicesLimit:
      typed.popularServicesLimit ??
      typed.categoriesLimit ??
      DEFAULT_HOMEPAGE_CONFIG.popularServicesLimit,
  };
}

export async function hasManualFeaturedServices(): Promise<boolean> {
  const count = await db.homepageItem.count({
    where: { type: "FEATURED_SERVICE" },
  });
  return count > 0;
}

export async function getHomepageItemsForAdmin(): Promise<HomepageItemData[]> {
  const [rows, config] = await Promise.all([
    db.homepageItem.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    }),
    getHomepageConfigForAdmin(),
  ]);

  const limit = config.popularServicesLimit || config.categoriesLimit || 8;
  const dynamicFeatured = await buildDynamicFeaturedServices(limit);

  if (rows.length === 0) {
    return [...dynamicFeatured, ...mapDefaultItems()];
  }

  const mapped = rows.map(mapItem);
  const withoutFeatured = mapped.filter((i) => i.type !== "FEATURED_SERVICE");
  return [...dynamicFeatured, ...withoutFeatured];
}

export async function getHomepageContent() {
  const [configRow, itemRows, categories] = await Promise.all([
    db.homepageConfig.findUnique({ where: { id: "default" } }),
    db.homepageItem.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    }),
    getActiveCategories(),
  ]);

  const config: HomepageConfigData = configRow
    ? {
        ...DEFAULT_HOMEPAGE_CONFIG,
        ...(configRow as HomepageConfigData),
        popularServicesLimit:
          (configRow as HomepageConfigData).popularServicesLimit ??
          (configRow as HomepageConfigData).categoriesLimit ??
          DEFAULT_HOMEPAGE_CONFIG.popularServicesLimit,
      }
    : DEFAULT_HOMEPAGE_CONFIG;

  const cmsItems: HomepageItemData[] =
    itemRows.length > 0 ? itemRows.map(mapItem) : mapDefaultItems();

  const categoriesLimit = config.categoriesLimit || 8;
  const slicedCategories = categories.slice(0, categoriesLimit);

  const categoriesForCovers = categories.map((c) => ({
    slug: c.slug,
    name: c.name,
    coverImageUrl: c.coverImageUrl,
    icon: c.icon,
  }));

  const featuredSource = await resolveFeaturedServiceItems(config, cmsItems);

  const featuredServices = await enrichFeaturedServices(
    featuredSource,
    categoriesForCovers,
  );

  return {
    config,
    featuredServices,
    stats: activeByType(cmsItems, "STAT"),
    testimonials: activeByType(cmsItems, "TESTIMONIAL"),
    howItWorksSteps: activeByType(cmsItems, "HOW_IT_WORKS_STEP"),
    categories: slicedCategories,
  };
}

export type HomepageContent = Awaited<ReturnType<typeof getHomepageContent>>;

export type HomepagePickerOption = {
  services: {
    id: string;
    name: string;
    categoryName: string;
    categorySlug: string;
  }[];
  listings: {
    id: string;
    title: string;
    price: number;
    categoryName: string;
    imageUrl: string | null;
  }[];
};

export async function getHomepagePickersForAdmin(): Promise<HomepagePickerOption> {
  const [services, listings] = await Promise.all([
    db.service.findMany({
      where: { isActive: true, category: { isActive: true } },
      select: {
        id: true,
        name: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      take: 200,
    }),
    db.listing.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        price: true,
        category: { select: { name: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return {
    services: services.map((s) => ({
      id: s.id,
      name: s.name,
      categoryName: s.category.name,
      categorySlug: s.category.slug,
    })),
    listings: listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      categoryName: l.category.name,
      imageUrl: l.images[0]?.url ?? null,
    })),
  };
}
