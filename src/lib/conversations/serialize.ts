import type { Message, PrivateOffer } from "@/generated/prisma/client";

type MessageWithOffer = Message & {
  privateOffer?: PrivateOffer | null;
};

export function serializeMessage(m: MessageWithOffer) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    type: m.type,
    body: m.body,
    readAt: m.readAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
    privateOffer: m.privateOffer
      ? {
          id: m.privateOffer.id,
          title: m.privateOffer.title,
          price: m.privateOffer.price,
          description: m.privateOffer.description,
          scheduledAt: m.privateOffer.scheduledAt?.toISOString() ?? null,
          durationHours: m.privateOffer.durationHours,
          warrantyNote: m.privateOffer.warrantyNote,
          status: m.privateOffer.status,
        }
      : null,
  };
}
