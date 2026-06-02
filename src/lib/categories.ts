import { db } from "@/lib/db";

export async function getActiveCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { services: true } },
    },
  });
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findFirst({
    where: { slug, isActive: true },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}

export async function getCategoriesWithServices() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      icon: true,
      coverImageUrl: true,
      services: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
  });
}
