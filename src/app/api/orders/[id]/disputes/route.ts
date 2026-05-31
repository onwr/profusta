import {
  DisputeActorRole,
  DisputeEventType,
  DisputePhase,
  DisputeStatus,
  OrderStatus,
} from "@/generated/prisma/client";
import { requireCustomer, requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import {
  appendDisputeEvent,
  serializeDisputeWithEvents,
} from "@/lib/orders/disputes";
import { canOpenDispute } from "@/lib/orders/cancel-rules";
import { getOrderForUser } from "@/lib/orders/access";
import { notifyOrderUpdate } from "@/lib/notifications/create";
import { createDisputeSchema } from "@/lib/validations/dispute";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result) return jsonError("Sipariş bulunamadı", 404);

    const disputes = await db.dispute.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "desc" },
      include: {
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    return jsonSuccess({
      disputes: disputes.map(serializeDisputeWithEvents),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const check = canOpenDispute(result.order);
    if (!check.ok) return jsonError(check.error!, 400);

    const open = await db.dispute.findFirst({
      where: { orderId: id, status: DisputeStatus.OPEN },
    });
    if (open) return jsonError("Açık itiraz zaten var", 409);

    const { description } = createDisputeSchema.parse(await request.json());

    const dispute = await db.$transaction(async (tx) => {
      const created = await tx.dispute.create({
        data: {
          orderId: id,
          customerId: user!.id,
          description: description.trim(),
          phase: DisputePhase.AWAITING_PROVIDER,
        },
      });
      await appendDisputeEvent(tx, {
        disputeId: created.id,
        type: DisputeEventType.CUSTOMER_OPENED,
        message: description.trim(),
        actor: { role: DisputeActorRole.CUSTOMER, id: user!.id },
      });
      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.DISPUTED },
      });
      return tx.dispute.findUniqueOrThrow({
        where: { id: created.id },
        include: { events: { orderBy: { createdAt: "asc" } } },
      });
    });

    const providerUser = await db.provider.findUnique({
      where: { id: result.order.providerId },
      include: { user: { select: { id: true, email: true } } },
    });
    if (providerUser) {
      await notifyOrderUpdate({
        userId: providerUser.user.id,
        email: providerUser.user.email,
        title: "İtiraz açıldı",
        body: `${result.order.title} siparişinde müşteri itiraz açtı.`,
        orderTitle: result.order.title,
        link: `${appUrl()}/usta/isler/${id}`,
      });
    }

    return jsonSuccess({ dispute: serializeDisputeWithEvents(dispute) }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
