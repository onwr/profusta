import {
  DisputeActorRole,
  DisputeEventType,
  DisputePhase,
  DisputeStatus,
  OrderStatus,
} from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import {
  appendDisputeEvent,
  serializeDisputeWithEvents,
} from "@/lib/orders/disputes";
import { getOrderForUser } from "@/lib/orders/access";
import { notifyOrderUpdate } from "@/lib/notifications/create";
import { providerMessageSchema } from "@/lib/validations/dispute";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string; disputeId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id, disputeId } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isProvider) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    if (result.order.status !== OrderStatus.DISPUTED) {
      return jsonError("Sipariş itiraz durumunda değil", 400);
    }

    const dispute = await db.dispute.findFirst({
      where: {
        id: disputeId,
        orderId: id,
        status: DisputeStatus.OPEN,
        phase: DisputePhase.AWAITING_PROVIDER,
      },
    });
    if (!dispute) return jsonError("Açık itiraz bulunamadı", 404);

    const { message } = providerMessageSchema.parse(await request.json());

    const updated = await db.$transaction(async (tx) => {
      await appendDisputeEvent(tx, {
        disputeId: dispute.id,
        type: DisputeEventType.PROVIDER_MESSAGE,
        message,
        actor: {
          role: DisputeActorRole.PROVIDER,
          id: user!.provider?.id ?? user!.id,
        },
      });
      return tx.dispute.update({
        where: { id: dispute.id },
        data: { providerResponse: message.trim() },
        include: { events: { orderBy: { createdAt: "asc" } } },
      });
    });

    await notifyOrderUpdate({
      userId: result.order.customerId,
      email: result.order.customer.email,
      title: "Usta yanıt verdi",
      body: "İtirazınıza usta bir mesaj bıraktı.",
      orderTitle: result.order.title,
      link: `${appUrl()}/musteri/siparisler/${id}`,
    });

    return jsonSuccess({ dispute: serializeDisputeWithEvents(updated) });
  } catch (err) {
    return handleApiError(err);
  }
}
