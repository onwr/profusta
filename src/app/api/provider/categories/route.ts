import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getActiveCategories } from "@/lib/categories";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { updateProviderCategoriesSchema } from "@/lib/validations/provider";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    const [available, selected] = await Promise.all([
      getActiveCategories(),
      provider
        ? db.providerCategory.findMany({
            where: { providerId: provider.id },
            select: { categorySlug: true },
          })
        : Promise.resolve([]),
    ]);

    return jsonSuccess({
      available: available.map((c) => ({
        slug: c.slug,
        name: c.name,
        icon: c.icon,
        coverImageUrl: c.coverImageUrl,
        description: c.description,
        serviceCount: c._count.services,
      })),
      selectedSlugs: selected.map((s) => s.categorySlug),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const { categorySlugs } = updateProviderCategoriesSchema.parse(
      await request.json(),
    );

    const slugs = [...new Set(categorySlugs.map((s) => toSlug(s)))];
    const active = await db.category.findMany({
      where: { isActive: true, slug: { in: slugs } },
      select: { slug: true },
    });

    if (active.length !== slugs.length) {
      return jsonError("Geçersiz veya pasif kategori seçildi", 400);
    }

    await db.$transaction(async (tx) => {
      await tx.providerCategory.deleteMany({ where: { providerId: provider.id } });
      if (slugs.length > 0) {
        await tx.providerCategory.createMany({
          data: slugs.map((categorySlug) => ({
            providerId: provider.id,
            categorySlug,
          })),
        });
      }
    });

    return jsonSuccess({ selectedSlugs: slugs });
  } catch (err) {
    return handleApiError(err);
  }
}
