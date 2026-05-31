import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { categoryUpdateSchema } from "@/lib/validations/category";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) return jsonError("Kategori bulunamadı", 404);

    const nextName = data.name?.trim() ?? existing.name;
    const nextSlug =
      data.slug?.trim() || (data.name ? toSlug(data.name) : existing.slug);
    const nameNorm = nextName.toLocaleLowerCase("tr-TR");

    const conflict = await db.category.findFirst({
      where: {
        id: { not: id },
        OR: [{ slug: nextSlug }, { name: nextName }],
      },
    });
    if (conflict) {
      return jsonError(
        `Çakışma: "${conflict.name}" (/${conflict.slug}) zaten var.`,
        409,
      );
    }

    const others = await db.category.findMany({
      where: { id: { not: id } },
      select: { name: true },
    });
    if (
      others.some((c) => c.name.trim().toLocaleLowerCase("tr-TR") === nameNorm)
    ) {
      return jsonError("Bu isimde başka bir kategori zaten var.", 409);
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: nextName,
        slug: nextSlug,
        icon: data.icon,
        ...(data.coverImageUrl !== undefined && {
          coverImageUrl: data.coverImageUrl,
        }),
        description: data.description,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    return jsonSuccess({ category });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await db.category.delete({ where: { id } });
    return jsonSuccess({ message: "Kategori silindi" });
  } catch (err) {
    return handleApiError(err);
  }
}
