import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { serviceCreateSchema } from "@/lib/validations/category";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const services = await db.service.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: { select: { id: true, name: true, slug: true } } },
    });

    return jsonSuccess({ services });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const data = serviceCreateSchema.parse(body);

    const category = await db.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) return jsonError("Kategori bulunamadı", 404);

    const name = data.name.trim();
    const slug = data.slug?.trim() || toSlug(name);
    const nameNorm = name.toLocaleLowerCase("tr-TR");

    const slugTaken = await db.service.findUnique({
      where: { categoryId_slug: { categoryId: data.categoryId, slug } },
    });
    if (slugTaken) {
      return jsonError(
        `Bu slug bu kategoride kullanılıyor: /${slugTaken.slug} ("${slugTaken.name}")`,
        409,
      );
    }

    const siblings = await db.service.findMany({
      where: { categoryId: data.categoryId },
      select: { id: true, name: true },
    });
    const nameCollision = siblings.find(
      (s) => s.name.trim().toLocaleLowerCase("tr-TR") === nameNorm,
    );
    if (nameCollision) {
      return jsonError(
        `Bu kategoride "${nameCollision.name}" zaten var. Mevcut kaydı düzenleyin veya birleştirin.`,
        409,
      );
    }

    const maxOrder = await db.service.aggregate({
      where: { categoryId: data.categoryId },
      _max: { sortOrder: true },
    });

    const service = await db.service.create({
      data: {
        categoryId: data.categoryId,
        name,
        slug,
        description: data.description,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        isActive: data.isActive ?? true,
      },
    });

    return jsonSuccess({ service }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
