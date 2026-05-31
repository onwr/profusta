import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { serviceUpdateSchema } from "@/lib/validations/category";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const data = serviceUpdateSchema.parse(body);

    const existing = await db.service.findUnique({ where: { id } });
    if (!existing) return jsonError("Hizmet bulunamadı", 404);

    const nextName = data.name?.trim() ?? existing.name;
    const nextSlug =
      data.slug?.trim() || (data.name ? toSlug(data.name) : existing.slug);
    const nameNorm = nextName.toLocaleLowerCase("tr-TR");

    const slugConflict = await db.service.findFirst({
      where: {
        id: { not: id },
        categoryId: existing.categoryId,
        slug: nextSlug,
      },
    });
    if (slugConflict) {
      return jsonError(
        `Slug çakışması: /${slugConflict.slug} ("${slugConflict.name}")`,
        409,
      );
    }

    const siblings = await db.service.findMany({
      where: { categoryId: existing.categoryId, id: { not: id } },
      select: { name: true },
    });
    if (
      siblings.some((s) => s.name.trim().toLocaleLowerCase("tr-TR") === nameNorm)
    ) {
      return jsonError("Bu kategoride aynı isimde başka alt hizmet var.", 409);
    }

    const service = await db.service.update({
      where: { id },
      data: {
        name: nextName,
        slug: nextSlug,
        description: data.description,
        sortOrder: data.sortOrder,
        isActive: data.isActive,
      },
    });

    return jsonSuccess({ service });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await db.service.delete({ where: { id } });
    return jsonSuccess({ message: "Hizmet silindi" });
  } catch (err) {
    return handleApiError(err);
  }
}
