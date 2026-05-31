import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getOrderForUser } from "@/lib/orders/access";
import { serializeOrder } from "@/lib/orders/serialize";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result) return jsonError("Sipariş bulunamadı", 404);

    return jsonSuccess({
      order: serializeOrder({
        ...result.order,
        customer: result.order.customer,
        provider: result.order.provider,
        payments: result.order.payments,
      }),
      isCustomer: result.isCustomer,
      isProvider: result.isProvider,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
