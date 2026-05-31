import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";
import { getHomepageItemsForAdmin } from "@/lib/homepage/get-homepage-content";
import { homepageItemCreateSchema } from "@/lib/validations/homepage";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    return jsonSuccess({ items: await getHomepageItemsForAdmin() });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const data = homepageItemCreateSchema.parse(await request.json());
    const maxOrder = await db.homepageItem.aggregate({
      where: { type: data.type },
      _max: { sortOrder: true },
    });

    const item = await db.homepageItem.create({
      data: {
        type: data.type,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
        isActive: data.isActive ?? true,
        title: data.title ?? null,
        subtitle: data.subtitle ?? null,
        description: data.description ?? null,
        body: data.body ?? null,
        priceLabel: data.priceLabel ?? null,
        icon: data.icon ?? null,
        href: data.href ?? null,
        stepNumber: data.stepNumber ?? null,
        bullets: data.bullets ?? undefined,
        rating: data.rating ?? null,
        serviceId: data.serviceId ?? null,
        listingId: data.listingId ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "homepage_item_create",
      details: JSON.stringify({ id: item.id, type: item.type }),
    });

    return jsonSuccess({ item });
  } catch (err) {
    return handleApiError(err);
  }
}
