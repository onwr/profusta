import { OrderStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getOrderForUser } from "@/lib/orders/access";
import { transitionOrder } from "@/lib/orders/transitions";
import { serializeOrder } from "@/lib/orders/serialize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isProvider) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    if (result.order.status !== OrderStatus.PAID_ESCROW) {
      return jsonError("Sipariş bu adımda kabul edilemez", 400);
    }

    const tr = await transitionOrder(result.order, OrderStatus.PROVIDER_ACCEPTED);
    if (!tr.ok) return jsonError(tr.error, tr.status);

    return jsonSuccess({ order: serializeOrder(tr.order) });
  } catch (err) {
    return handleApiError(err);
  }
}
