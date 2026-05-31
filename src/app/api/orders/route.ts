import { OrderStatus } from "@/generated/prisma/client";
import { requireCustomer, requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { createOrderFromSource } from "@/lib/orders/create";
import { paymentUrlForOrder } from "@/lib/orders/payment-url";
import { serializeOrder } from "@/lib/orders/serialize";
import { db } from "@/lib/db";
import { createOrderSchema } from "@/lib/validations/order";

export async function GET() {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const isProvider = user!.role === "PROVIDER" && user!.provider;

    const orders = await db.order.findMany({
      where: isProvider
        ? { providerId: user!.provider!.id }
        : { customerId: user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { fullName: true, email: true } },
        provider: { include: { user: { select: { fullName: true } } } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
        disputes: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { description: true, status: true, phase: true },
        },
      },
    });

    return jsonSuccess({ orders: orders.map(serializeOrder) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const body = createOrderSchema.parse(await request.json());
    const result = await createOrderFromSource({
      customerId: user!.id,
      sourceType: body.sourceType,
      sourceId: body.sourceId,
    });

    if (!result.ok) return jsonError(result.error, result.status);

    return jsonSuccess(
      {
        order: serializeOrder(result.order),
        paymentUrl: paymentUrlForOrder(result.order.id),
        created: result.created,
      },
      result.created ? 201 : 200,
    );
  } catch (err) {
    return handleApiError(err);
  }
}
