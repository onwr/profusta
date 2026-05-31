import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { serializeOrder } from "@/lib/orders/serialize";
import { db } from "@/lib/db";
import { OrderStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const status = new URL(request.url).searchParams.get("status") as
      | OrderStatus
      | null;

    const orders = await db.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        customer: { select: { fullName: true, email: true } },
        provider: { include: { user: { select: { fullName: true } } } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return jsonSuccess({ orders: orders.map(serializeOrder) });
  } catch (err) {
    return handleApiError(err);
  }
}
