import { CouponDiscountType } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export type CouponValidationResult =
  | {
      ok: true;
      coupon: {
        id: string;
        code: string;
        discountType: CouponDiscountType;
        discountValue: number;
      };
      discountAmount: number;
      payableAmount: number;
    }
  | { ok: false; error: string };

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

export function calculateCouponDiscount(
  discountType: CouponDiscountType,
  discountValue: number,
  subtotal: number,
) {
  if (subtotal <= 0) return 0;

  if (discountType === CouponDiscountType.PERCENT) {
    const pct = Math.min(Math.max(discountValue, 0), 100);
    return Math.round(subtotal * (pct / 100) * 100) / 100;
  }

  return Math.round(Math.min(Math.max(discountValue, 0), subtotal) * 100) / 100;
}

export function getOrderSubtotal(amount: number, discountAmount: number) {
  return Math.round((amount + discountAmount) * 100) / 100;
}

export async function validateCouponForOrder(
  code: string,
  subtotal: number,
): Promise<CouponValidationResult> {
  const normalized = normalizeCode(code);
  if (!normalized) {
    return { ok: false, error: "Kupon kodu girin" };
  }

  const coupon = await db.coupon.findUnique({
    where: { code: normalized },
  });

  if (!coupon || !coupon.isActive) {
    return { ok: false, error: "Geçersiz kupon kodu" };
  }

  const now = new Date();
  if (coupon.validFrom && coupon.validFrom > now) {
    return { ok: false, error: "Kupon henüz geçerli değil" };
  }
  if (coupon.validUntil && coupon.validUntil < now) {
    return { ok: false, error: "Kupon süresi dolmuş" };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, error: "Kupon kullanım limitine ulaşıldı" };
  }
  if (coupon.minOrderAmount != null && subtotal < coupon.minOrderAmount) {
    return {
      ok: false,
      error: `Bu kupon en az ${coupon.minOrderAmount.toLocaleString("tr-TR")} ₺ siparişlerde geçerlidir`,
    };
  }

  const discountAmount = calculateCouponDiscount(
    coupon.discountType,
    coupon.discountValue,
    subtotal,
  );

  if (discountAmount <= 0) {
    return { ok: false, error: "Kupon bu siparişe uygulanamıyor" };
  }

  const payableAmount = Math.round((subtotal - discountAmount) * 100) / 100;

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    },
    discountAmount,
    payableAmount,
  };
}

export async function incrementCouponUsage(couponId: string) {
  await db.coupon.update({
    where: { id: couponId },
    data: { usedCount: { increment: 1 } },
  });
}
