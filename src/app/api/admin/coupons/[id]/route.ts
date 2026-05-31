import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations/coupon";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const data = couponSchema.partial().parse(await request.json());

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...(data.code != null ? { code: data.code.toUpperCase().trim() } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
        ...(data.discountType != null ? { discountType: data.discountType } : {}),
        ...(data.discountValue != null
          ? { discountValue: data.discountValue }
          : {}),
        ...(data.minOrderAmount !== undefined
          ? { minOrderAmount: data.minOrderAmount }
          : {}),
        ...(data.maxUses !== undefined ? { maxUses: data.maxUses } : {}),
        ...(data.validFrom !== undefined
          ? { validFrom: data.validFrom ? new Date(data.validFrom) : null }
          : {}),
        ...(data.validUntil !== undefined
          ? { validUntil: data.validUntil ? new Date(data.validUntil) : null }
          : {}),
        ...(data.isActive != null ? { isActive: data.isActive } : {}),
      },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "coupon_update",
      entityType: "coupon",
      entityId: id,
    });

    return jsonSuccess({ coupon });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await db.coupon.delete({ where: { id } });

    await logAdminAction({
      adminId: user!.id,
      action: "coupon_delete",
      entityType: "coupon",
      entityId: id,
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
