import { ProviderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getActiveCategories } from "@/lib/categories";

export type ServiceSearchProvider = {
  id: string;
  slug: string | null;
  fullName: string;
  baseCity: string | null;
  baseDistrict: string | null;
  categories: string[];
};

export type ServiceSearchResult = {
  query: string | null;
  categories: Awaited<ReturnType<typeof getActiveCategories>>;
  providers: ServiceSearchProvider[];
};

export async function searchServicesCatalog(
  rawQuery?: string,
): Promise<ServiceSearchResult> {
  const query = rawQuery?.trim() ?? "";

  if (!query) {
    return {
      query: null,
      categories: await getActiveCategories(),
      providers: [],
    };
  }

  const [categories, providers] = await Promise.all([
    db.category.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { slug: { contains: query } },
          {
            services: {
              some: {
                isActive: true,
                OR: [
                  { name: { contains: query } },
                  { description: { contains: query } },
                  { slug: { contains: query } },
                ],
              },
            },
          },
        ],
      },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { services: true } },
      },
    }),
    db.provider.findMany({
      where: {
        status: ProviderStatus.APPROVED,
        OR: [
          { user: { fullName: { contains: query } } },
          { bio: { contains: query } },
          { baseCity: { contains: query } },
          { baseDistrict: { contains: query } },
        ],
      },
      take: 6,
      include: {
        user: { select: { fullName: true } },
        categories: { select: { categorySlug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    query,
    categories,
    providers: providers.map((provider) => ({
      id: provider.id,
      slug: provider.slug,
      fullName: provider.user.fullName,
      baseCity: provider.baseCity,
      baseDistrict: provider.baseDistrict,
      categories: provider.categories.map((item) => item.categorySlug),
    })),
  };
}

function formatCategory(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

export function formatProviderCategoryLabel(slug: string) {
  return formatCategory(slug);
}
