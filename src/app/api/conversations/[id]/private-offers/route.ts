import { MessageType } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getConversationForUser } from "@/lib/conversations/access";
import { serializeMessage } from "@/lib/conversations/serialize";
import { db } from "@/lib/db";
import { createPrivateOfferSchema } from "@/lib/validations/conversation";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result || !result.isProvider) {
      return jsonError("Konuşma bulunamadı", 404);
    }

    const data = createPrivateOfferSchema.parse(await request.json());
    const scheduledAt =
      data.scheduledAt && data.scheduledAt !== ""
        ? new Date(data.scheduledAt)
        : null;

    const message = await db.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user!.id,
          type: MessageType.PRIVATE_OFFER,
          body: null,
        },
      });

      await tx.privateOffer.create({
        data: {
          conversationId: id,
          messageId: createdMessage.id,
          title: data.title.trim(),
          price: data.price,
          description: data.description.trim(),
          scheduledAt,
          durationHours: data.durationHours ?? null,
          warrantyNote: data.warrantyNote?.trim() || null,
        },
      });

      await tx.conversation.update({
        where: { id },
        data: { lastMessageAt: createdMessage.createdAt },
      });

      return tx.message.findUnique({
        where: { id: createdMessage.id },
        include: { privateOffer: true },
      });
    });

    if (!message) return jsonError("Teklif oluşturulamadı", 500);

    return jsonSuccess({ message: serializeMessage(message) }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
