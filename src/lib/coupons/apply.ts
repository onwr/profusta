import { OrderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { calcCommission } from "@/lib/settings/commission";
import {
  getOrderSubtotal,
  validateCouponForOrder,
} from "@/lib/coupons/validate";

export async function applyCouponToOrder(orderId: string, code: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "Sipariş bulunamadı", status: 404 };
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return {
      ok: false as const,
      error: "Yalnızca ödeme bekleyen siparişlere kupon uygulanabilir",
      status: 400,
    };
  }

  const subtotal = getOrderSubtotal(order.amount, order.discountAmount);
  const validation = await validateCouponForOrder(code, subtotal);
  if (!validation.ok) {
    return { ok: false as const, error: validation.error, status: 400 };
  }

  const { commissionAmount, netAmount } = calcCommission(
    validation.payableAmount,
    order.commissionRate,
  );

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      amount: validation.payableAmount,
      discountAmount: validation.discountAmount,
      couponId: validation.coupon.id,
      couponCode: validation.coupon.code,
      commissionAmount,
      netAmount,
    },
  });

  return { ok: true as const, order: updated };
}

export async function removeCouponFromOrder(orderId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "Sipariş bulunamadı", status: 404 };
  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    return {
      ok: false as const,
      error: "Yalnızca ödeme bekleyen siparişlerden kupon kaldırılabilir",
      status: 400,
    };
  }
  if (!order.couponId) {
    return { ok: true as const, order };
  }

  const subtotal = getOrderSubtotal(order.amount, order.discountAmount);
  const { commissionAmount, netAmount } = calcCommission(
    subtotal,
    order.commissionRate,
  );

  const updated = await db.order.update({
    where: { id: order.id },
    data: {
      amount: subtotal,
      discountAmount: 0,
      couponId: null,
      couponCode: null,
      commissionAmount,
      netAmount,
    },
  });

  return { ok: true as const, order: updated };
}
