import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";
import { homepageItemUpdateSchema } from "@/lib/validations/homepage";

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const data = homepageItemUpdateSchema.parse(await request.json());

    const item = await db.homepageItem.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.body !== undefined && { body: data.body }),
        ...(data.priceLabel !== undefined && { priceLabel: data.priceLabel }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.href !== undefined && { href: data.href }),
        ...(data.stepNumber !== undefined && { stepNumber: data.stepNumber }),
        ...(data.bullets !== undefined && { bullets: data.bullets ?? undefined }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.serviceId !== undefined && {
          serviceId: data.serviceId,
        }),
        ...(data.listingId !== undefined && {
          listingId: data.listingId,
        }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
      },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "homepage_item_update",
      details: JSON.stringify({ id }),
    });

    return jsonSuccess({ item });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Props) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await db.homepageItem.delete({ where: { id } });

    await logAdminAction({
      adminId: user!.id,
      action: "homepage_item_delete",
      details: JSON.stringify({ id }),
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
