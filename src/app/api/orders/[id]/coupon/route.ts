import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import {
  applyCouponToOrder,
  removeCouponFromOrder,
} from "@/lib/coupons/apply";
import { getOrderSubtotal } from "@/lib/coupons/validate";
import { getOrderForUser } from "@/lib/orders/access";

type Params = { params: Promise<{ id: string }> };

const bodySchema = z.object({
  code: z.string().optional(),
  remove: z.boolean().optional(),
});

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const access = await getOrderForUser(id, user!);
    if (!access || !access.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const body = bodySchema.parse(await request.json());

    const result = body.remove
      ? await removeCouponFromOrder(id)
      : await applyCouponToOrder(id, body.code ?? "");

    if (!result.ok) {
      return jsonError(result.error, result.status);
    }

    const order = result.order;
    return jsonSuccess({
      order: {
        id: order.id,
        amount: order.amount,
        discountAmount: order.discountAmount,
        subtotal: getOrderSubtotal(order.amount, order.discountAmount),
        couponCode: order.couponCode,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
