import { ListingStatus } from "@/generated/prisma/client";
import { ROUTES } from "@/lib/constants";
import { categorySlugFromHref } from "@/lib/categories/resolve-cover";
import type { CategoryWithCover } from "@/lib/categories/resolve-cover";
import { db } from "@/lib/db";
import type { HomepageItemData } from "@/lib/homepage/defaults";

export type EnrichedFeaturedService = HomepageItemData & {
  coverImageUrl: string | null;
  categoryIcon: string | null;
  categorySlug: string | null;
};

function formatPriceLabel(price: number): string {
  return `Başlayan ${price.toLocaleString("tr-TR")} ₺`;
}

function nameKey(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function findCategoryByTitle(
  title: string,
  categories: CategoryWithCover[],
): CategoryWithCover | undefined {
  const key = nameKey(title);
  const exact = categories.find((c) => nameKey(c.name) === key);
  if (exact) return exact;

  return categories.find((c) => {
    const catKey = nameKey(c.name);
    return key.includes(catKey) || catKey.includes(key);
  });
}

export async function enrichFeaturedServices(
  items: HomepageItemData[],
  categories: CategoryWithCover[],
): Promise<EnrichedFeaturedService[]> {
  const coverBySlug = new Map(
    categories.map((c) => [c.slug, c.coverImageUrl] as const),
  );
  const iconBySlug = new Map(
    categories.map((c) => [c.slug, c.icon ?? null] as const),
  );
  const coverByName = new Map(
    categories.map(
      (c) => [nameKey(c.name), c.coverImageUrl] as const,
    ),
  );

  const listingIds = items
    .map((i) => i.listingId)
    .filter((id): id is string => Boolean(id));

  const serviceIds = items
    .map((i) => i.serviceId)
    .filter((id): id is string => Boolean(id));

  const listingMap = new Map<
    string,
    {
      title: string;
      description: string;
      price: number;
      imageUrl: string | null;
      categoryName: string;
      categorySlug: string;
      categoryCover: string | null;
      categoryIcon: string | null;
    }
  >();

  if (listingIds.length > 0) {
    const rows = await db.listing.findMany({
      where: { id: { in: listingIds }, status: ListingStatus.ACTIVE },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        images: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: { url: true },
        },
        category: {
          select: {
            name: true,
            slug: true,
            coverImageUrl: true,
            icon: true,
          },
        },
      },
    });
    for (const row of rows) {
      listingMap.set(row.id, {
        title: row.title,
        description: row.description,
        price: row.price,
        imageUrl: row.images[0]?.url ?? null,
        categoryName: row.category.name,
        categorySlug: row.category.slug,
        categoryCover: row.category.coverImageUrl,
        categoryIcon: row.category.icon,
      });
    }
  }

  type ServiceEntry = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    categoryName: string;
    categorySlug: string;
    categoryCover: string | null;
    categoryIcon: string | null;
  };

  const serviceMap = new Map<string, ServiceEntry>();
  const serviceByCategoryAndName = new Map<string, ServiceEntry>();

  const allServices = await db.service.findMany({
    where: { isActive: true, category: { isActive: true } },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: {
        select: {
          name: true,
          slug: true,
          coverImageUrl: true,
          icon: true,
        },
      },
    },
  });

  for (const row of allServices) {
    const entry = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      categoryName: row.category.name,
      categorySlug: row.category.slug,
      categoryCover: row.category.coverImageUrl,
      categoryIcon: row.category.icon,
    };
    serviceMap.set(row.id, entry);
    serviceByCategoryAndName.set(
      `${row.category.slug}::${nameKey(row.name)}`,
      entry,
    );
  }

  const categorySlugs = new Set<string>();
  for (const item of items) {
    const fromHref = categorySlugFromHref(item.href);
    if (fromHref) categorySlugs.add(fromHref);
    if (item.serviceId) {
      const slug = serviceMap.get(item.serviceId)?.categorySlug;
      if (slug) categorySlugs.add(slug);
    }
    if (item.listingId) {
      const slug = listingMap.get(item.listingId)?.categorySlug;
      if (slug) categorySlugs.add(slug);
    }
    if (item.title) {
      const cat = findCategoryByTitle(item.title, categories);
      if (cat) categorySlugs.add(cat.slug);
      const svc = [...serviceByCategoryAndName.values()].find(
        (s) => nameKey(s.name) === nameKey(item.title ?? ""),
      );
      if (svc) categorySlugs.add(svc.categorySlug);
    }
  }

  const minPriceByCategorySlug = new Map<string, number>();
  if (categorySlugs.size > 0) {
    const categoriesWithListings = await db.category.findMany({
      where: { slug: { in: [...categorySlugs] }, isActive: true },
      select: {
        slug: true,
        listings: {
          where: { status: ListingStatus.ACTIVE },
          orderBy: { price: "asc" },
          take: 1,
          select: { price: true },
        },
      },
    });
    for (const cat of categoriesWithListings) {
      const min = cat.listings[0]?.price;
      if (min != null) minPriceByCategorySlug.set(cat.slug, min);
    }
  }

  return items.map((item) => {
    let coverImageUrl = item.imageUrl ?? null;
    let title = item.title;
    let description = item.description;
    let href = item.href;
    let subtitle = item.subtitle;
    let categorySlug: string | null = categorySlugFromHref(href);
    let categoryIcon: string | null = categorySlug
      ? (iconBySlug.get(categorySlug) ?? null)
      : null;
    let resolvedServiceId = item.serviceId;

    if (item.listingId) {
      const listing = listingMap.get(item.listingId);
      if (listing) {
        coverImageUrl = listing.imageUrl ?? listing.categoryCover ?? coverImageUrl;
        href = `${ROUTES.listings}/${item.listingId}`;
        title = title ?? listing.title;
        description = description ?? listing.description.slice(0, 160);
        subtitle = subtitle ?? listing.categoryName;
        categorySlug = listing.categorySlug;
        categoryIcon = listing.categoryIcon;
      }
    }

    if (item.serviceId) {
      const service = serviceMap.get(item.serviceId);
      if (service) {
        if (!coverImageUrl) {
          coverImageUrl = service.categoryCover;
        }
        href = `${ROUTES.categories}/${service.categorySlug}?hizmet=${service.slug}`;
        title = title ?? service.name;
        description = description ?? service.description?.slice(0, 160) ?? null;
        subtitle = subtitle ?? service.categoryName;
        categorySlug = service.categorySlug;
        categoryIcon = service.categoryIcon;
      }
    }

    if (!resolvedServiceId && categorySlug && title) {
      const matched = serviceByCategoryAndName.get(
        `${categorySlug}::${nameKey(title)}`,
      );
      if (matched) {
        resolvedServiceId = matched.id;
        if (!coverImageUrl) coverImageUrl = matched.categoryCover;
        categoryIcon = matched.categoryIcon;
        if (!href || href === "/hizmetler") {
          href = `${ROUTES.categories}/${matched.categorySlug}?hizmet=${matched.slug}`;
        }
      }
    }

    if (title && !categorySlug) {
      const matchedService = allServices.find(
        (s) => nameKey(s.name) === nameKey(title),
      );
      if (matchedService) {
        categorySlug = matchedService.category.slug;
        categoryIcon = matchedService.category.icon;
        if (!coverImageUrl) {
          coverImageUrl = matchedService.category.coverImageUrl;
        }
        if (!href || href === "/hizmetler") {
          href = `${ROUTES.categories}/${matchedService.category.slug}?hizmet=${matchedService.slug}`;
        }
        subtitle = subtitle ?? matchedService.category.name;
      }
    }

    if (title && !categorySlug) {
      const cat = findCategoryByTitle(title, categories);
      if (cat) {
        categorySlug = cat.slug;
        categoryIcon = cat.icon ?? null;
        if (!coverImageUrl) coverImageUrl = cat.coverImageUrl;
        if (!href || href === "/hizmetler") {
          href = `${ROUTES.categories}/${cat.slug}`;
        }
        subtitle = subtitle ?? cat.name;
      }
    }

    if (!categorySlug) {
      categorySlug = categorySlugFromHref(href);
    }
    if (categorySlug && !categoryIcon) {
      categoryIcon = iconBySlug.get(categorySlug) ?? null;
    }

    if (!item.listingId && categorySlug && !coverImageUrl) {
      coverImageUrl = coverBySlug.get(categorySlug) ?? null;
    }

    if (!item.listingId && !coverImageUrl && title) {
      coverImageUrl = coverByName.get(nameKey(title)) ?? null;
    }

    if (!item.listingId && !coverImageUrl && title) {
      const cat = findCategoryByTitle(title, categories);
      if (cat?.coverImageUrl) {
        coverImageUrl = cat.coverImageUrl;
        categorySlug = categorySlug ?? cat.slug;
        categoryIcon = categoryIcon ?? cat.icon ?? null;
      }
    }

    let priceLabel: string | null = null;
    if (item.listingId) {
      const listing = listingMap.get(item.listingId);
      if (listing) {
        priceLabel = formatPriceLabel(listing.price);
      }
    } else if (categorySlug) {
      const minPrice = minPriceByCategorySlug.get(categorySlug);
      if (minPrice != null) {
        priceLabel = formatPriceLabel(minPrice);
      }
    }

    if ((!href || href === "/hizmetler") && categorySlug) {
      href = `${ROUTES.categories}/${categorySlug}`;
    }

    return {
      ...item,
      serviceId: resolvedServiceId,
      title,
      description,
      priceLabel,
      href,
      subtitle,
      coverImageUrl,
      categoryIcon,
      categorySlug,
    };
  });
}
