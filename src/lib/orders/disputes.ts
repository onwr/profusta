import {
  DisputeActorRole,
  DisputeEventType,
  DisputePhase,
  DisputeStatus,
  type Dispute,
  type DisputeEvent,
  type Prisma,
} from "@/generated/prisma/client";

export type DisputeActor = {
  role: DisputeActorRole;
  id?: string | null;
};

export async function appendDisputeEvent(
  tx: Prisma.TransactionClient,
  params: {
    disputeId: string;
    type: DisputeEventType;
    message: string;
    actor: DisputeActor;
  },
) {
  return tx.disputeEvent.create({
    data: {
      disputeId: params.disputeId,
      type: params.type,
      message: params.message.trim(),
      actorRole: params.actor.role,
      actorId: params.actor.id ?? null,
    },
  });
}

export function serializeDisputeEvent(e: DisputeEvent) {
  return {
    id: e.id,
    type: e.type,
    message: e.message,
    actorRole: e.actorRole,
    actorId: e.actorId,
    createdAt: e.createdAt.toISOString(),
  };
}

export type DisputeWithEvents = Dispute & { events: DisputeEvent[] };

export function serializeDisputeWithEvents(d: DisputeWithEvents) {
  return {
    id: d.id,
    orderId: d.orderId,
    description: d.description,
    status: d.status,
    phase: d.phase,
    providerResponse: d.providerResponse,
    adminDecision: d.adminDecision,
    refundAmount: d.refundAmount,
    resolvedAt: d.resolvedAt?.toISOString() ?? null,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    events: d.events.map(serializeDisputeEvent),
  };
}

export async function resolveDisputeOnCustomerAccept(
  tx: Prisma.TransactionClient,
  orderId: string,
  customerId: string,
) {
  const dispute = await tx.dispute.findFirst({
    where: {
      orderId,
      status: DisputeStatus.OPEN,
      phase: DisputePhase.AWAITING_CUSTOMER,
    },
  });
  if (!dispute) return null;

  await appendDisputeEvent(tx, {
    disputeId: dispute.id,
    type: DisputeEventType.CUSTOMER_ACCEPTED,
    message: "Müşteri düzeltmeyi onayladı ve işi tamamladı.",
    actor: { role: DisputeActorRole.CUSTOMER, id: customerId },
  });

  return tx.dispute.update({
    where: { id: dispute.id },
    data: {
      status: DisputeStatus.RESOLVED,
      phase: DisputePhase.CLOSED,
      resolvedAt: new Date(),
    },
  });
}
