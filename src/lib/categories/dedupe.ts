import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  coverImageUrl: string | null;
  sortOrder: number;
  _count: {
    services: number;
    listings: number;
    requests: number;
  };
};

function nameKey(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function scoreCategory(cat: CategoryRow): number {
  const expectedSlug = toSlug(cat.name);
  let score = 0;
  if (cat.slug === expectedSlug) score += 1000;
  if (cat.coverImageUrl) score += 50;
  score += cat._count.services * 10;
  score += cat._count.listings * 8;
  score += cat._count.requests * 5;
  score += cat.slug.length;
  return score;
}

async function mergeServices(fromCategoryId: string, toCategoryId: string) {
  const services = await db.service.findMany({
    where: { categoryId: fromCategoryId },
  });

  for (const svc of services) {
    const target = await db.service.findUnique({
      where: {
        categoryId_slug: { categoryId: toCategoryId, slug: svc.slug },
      },
    });

    if (target) {
      await db.serviceRequest.updateMany({
        where: { serviceId: svc.id },
        data: { serviceId: target.id },
      });
      await db.homepageItem.updateMany({
        where: { serviceId: svc.id },
        data: { serviceId: target.id },
      });
      await db.service.delete({ where: { id: svc.id } });
    } else {
      await db.service.update({
        where: { id: svc.id },
        data: { categoryId: toCategoryId },
      });
    }
  }
}

async function mergeProviderCategorySlugs(fromSlug: string, toSlug: string) {
  const rows = await db.providerCategory.findMany({
    where: { categorySlug: fromSlug },
  });

  for (const row of rows) {
    const exists = await db.providerCategory.findUnique({
      where: {
        providerId_categorySlug: {
          providerId: row.providerId,
          categorySlug: toSlug,
        },
      },
    });
    if (exists) {
      await db.providerCategory.delete({ where: { id: row.id } });
    } else {
      await db.providerCategory.update({
        where: { id: row.id },
        data: { categorySlug: toSlug },
      });
    }
  }
}

async function mergeIntoCanonical(duplicate: CategoryRow, canonical: CategoryRow) {
  await mergeServices(duplicate.id, canonical.id);

  await db.listing.updateMany({
    where: { categoryId: duplicate.id },
    data: { categoryId: canonical.id },
  });

  await db.serviceRequest.updateMany({
    where: { categoryId: duplicate.id },
    data: { categoryId: canonical.id },
  });

  await mergeProviderCategorySlugs(duplicate.slug, canonical.slug);

  if (!canonical.coverImageUrl && duplicate.coverImageUrl) {
    await db.category.update({
      where: { id: canonical.id },
      data: { coverImageUrl: duplicate.coverImageUrl },
    });
  }

  await db.category.delete({ where: { id: duplicate.id } });
}

export type DedupeCategoriesResult = {
  merged: { name: string; kept: string; removed: string[] }[];
  unchanged: number;
};

/** Aynı isimli yinelenen kategorileri birleştirir (en doğru slug + en çok içerik kalır). */
export async function dedupeCategories(): Promise<DedupeCategoriesResult> {
  const categories = await db.category.findMany({
    include: {
      _count: {
        select: { services: true, listings: true, requests: true },
      },
    },
  });

  const groups = new Map<string, CategoryRow[]>();
  for (const cat of categories) {
    const key = nameKey(cat.name);
    const list = groups.get(key) ?? [];
    list.push(cat);
    groups.set(key, list);
  }

  const merged: DedupeCategoriesResult["merged"] = [];
  let unchanged = 0;

  for (const [, group] of groups) {
    if (group.length === 1) {
      unchanged += 1;
      continue;
    }

    const sorted = [...group].sort((a, b) => scoreCategory(b) - scoreCategory(a));
    const canonical = sorted[0]!;
    const duplicates = sorted.slice(1);

    const expectedSlug = toSlug(canonical.name);
    if (canonical.slug !== expectedSlug) {
      const slugTaken = await db.category.findUnique({
        where: { slug: expectedSlug },
      });
      if (!slugTaken) {
        await mergeProviderCategorySlugs(canonical.slug, expectedSlug);
        await db.category.update({
          where: { id: canonical.id },
          data: { slug: expectedSlug },
        });
        canonical.slug = expectedSlug;
      }
    }

    for (const dup of duplicates) {
      await mergeIntoCanonical(dup, canonical);
    }

    merged.push({
      name: canonical.name,
      kept: canonical.slug,
      removed: duplicates.map((d) => d.slug),
    });
  }

  return { merged, unchanged };
}
