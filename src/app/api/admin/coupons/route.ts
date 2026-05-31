import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";
import { couponSchema } from "@/lib/validations/coupon";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return jsonSuccess({ coupons });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const data = couponSchema.parse(await request.json());
    const coupon = await db.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        description: data.description?.trim() || null,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount ?? null,
        maxUses: data.maxUses ?? null,
        validFrom: data.validFrom ? new Date(data.validFrom) : null,
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive ?? true,
      },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "coupon_create",
      entityType: "coupon",
      entityId: coupon.id,
      details: coupon.code,
    });

    return jsonSuccess({ coupon }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
