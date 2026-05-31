import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { categoryCreateSchema } from "@/lib/validations/category";

function normalizeCategoryName(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const categories = await db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { services: true } } },
    });

    return jsonSuccess({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const data = categoryCreateSchema.parse(body);
    const name = data.name.trim();
    const slug = data.slug?.trim() || toSlug(name);
    const nameNorm = normalizeCategoryName(name);

    const existing = await db.category.findFirst({
      where: {
        OR: [{ slug }, { name }],
      },
    });

    if (existing) {
      return jsonError(
        `"${existing.name}" zaten kayıtlı (/${existing.slug}). Yinelenen kategori oluşturulamaz.`,
        409,
      );
    }

    const sameName = await db.category.findMany({ select: { id: true, name: true } });
    const nameCollision = sameName.find(
      (c) => normalizeCategoryName(c.name) === nameNorm,
    );
    if (nameCollision) {
      return jsonError(
        `Bu isimde kategori zaten var: "${nameCollision.name}". Mevcut kaydı düzenleyin.`,
        409,
      );
    }

    const maxOrder = await db.category.aggregate({ _max: { sortOrder: true } });

    const category = await db.category.create({
      data: {
        name,
        slug,
        icon: data.icon,
        coverImageUrl: data.coverImageUrl ?? null,
        description: data.description,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        isActive: data.isActive ?? true,
      },
    });

    return jsonSuccess({ category }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
