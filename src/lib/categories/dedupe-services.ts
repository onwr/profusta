import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";

type ServiceRow = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  category: { name: string; slug: string };
  _count: { requests: number };
};

function nameKey(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

function groupKey(categoryId: string, name: string) {
  return `${categoryId}::${nameKey(name)}`;
}

function scoreService(svc: ServiceRow): number {
  const expectedSlug = toSlug(svc.name);
  let score = 0;
  if (svc.slug === expectedSlug) score += 1000;
  if (svc.isActive) score += 100;
  score += svc._count.requests * 10;
  score += svc.slug.length;
  return score;
}

async function mergeIntoCanonical(duplicate: ServiceRow, canonical: ServiceRow) {
  await db.serviceRequest.updateMany({
    where: { serviceId: duplicate.id },
    data: { serviceId: canonical.id },
  });

  await db.homepageItem.updateMany({
    where: { serviceId: duplicate.id },
    data: { serviceId: canonical.id },
  });

  await db.service.delete({ where: { id: duplicate.id } });
}

export type DedupeServicesResult = {
  merged: {
    category: string;
    name: string;
    kept: string;
    removed: string[];
  }[];
  unchanged: number;
};

/** Aynı kategoride aynı isimli yinelenen alt hizmetleri birleştirir. */
export async function dedupeServices(): Promise<DedupeServicesResult> {
  const services = await db.service.findMany({
    include: {
      category: { select: { name: true, slug: true } },
      _count: { select: { requests: true } },
    },
  });

  const groups = new Map<string, ServiceRow[]>();
  for (const svc of services) {
    const key = groupKey(svc.categoryId, svc.name);
    const list = groups.get(key) ?? [];
    list.push(svc);
    groups.set(key, list);
  }

  const merged: DedupeServicesResult["merged"] = [];
  let unchanged = 0;

  for (const [, group] of groups) {
    if (group.length === 1) {
      unchanged += 1;
      const only = group[0]!;
      const expectedSlug = toSlug(only.name);
      if (only.slug !== expectedSlug) {
        const taken = await db.service.findUnique({
          where: {
            categoryId_slug: {
              categoryId: only.categoryId,
              slug: expectedSlug,
            },
          },
        });
        if (!taken || taken.id === only.id) {
          await db.service.update({
            where: { id: only.id },
            data: { slug: expectedSlug },
          });
        }
      }
      continue;
    }

    const sorted = [...group].sort((a, b) => scoreService(b) - scoreService(a));
    const canonical = sorted[0]!;
    const duplicates = sorted.slice(1);

    const expectedSlug = toSlug(canonical.name);
    if (canonical.slug !== expectedSlug) {
      const taken = await db.service.findUnique({
        where: {
          categoryId_slug: {
            categoryId: canonical.categoryId,
            slug: expectedSlug,
          },
        },
      });
      if (!taken || taken.id === canonical.id) {
        await db.service.update({
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
      category: canonical.category.name,
      name: canonical.name,
      kept: canonical.slug,
      removed: duplicates.map((d) => d.slug),
    });
  }

  return { merged, unchanged };
}
