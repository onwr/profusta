import { OrderStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { getOrderForUser } from "@/lib/orders/access";
import { createReviewSchema } from "@/lib/validations/review";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    if (result.order.status !== OrderStatus.COMPLETED) {
      return jsonError("Yorum yalnızca tamamlanan siparişler için", 400);
    }

    const existing = await db.review.findUnique({
      where: { orderId: id },
    });
    if (existing) return jsonError("Bu sipariş için zaten yorum var", 409);

    const data = createReviewSchema.parse(await request.json());

    const review = await db.review.create({
      data: {
        orderId: id,
        customerId: user!.id,
        providerId: result.order.providerId,
        rating: data.rating,
        comment: data.comment.trim(),
      },
    });

    return jsonSuccess({ review }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
