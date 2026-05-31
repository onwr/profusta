import { MessageType } from "@/generated/prisma/client";
import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { enforceRateLimit } from "@/lib/api/rate-limit-response";
import { getConversationForUser } from "@/lib/conversations/access";
import { serializeMessage } from "@/lib/conversations/serialize";
import { db } from "@/lib/db";
import { validateMessageBody } from "@/lib/messages/safety";
import { notifyMessageReceived } from "@/lib/notifications/create";
import { StorageConfigError } from "@/lib/storage";
import { saveMessageImage } from "@/lib/upload";
import { sendMessageSchema } from "@/lib/validations/conversation";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string }> };

async function notifyRecipient(
  result: NonNullable<Awaited<ReturnType<typeof getConversationForUser>>>,
  conversationId: string,
  preview: string,
) {
  const { conversation, isCustomer } = result;
  const recipientId = isCustomer
    ? conversation.provider.user.id
    : conversation.customerId;
  const recipient = await db.user.findUnique({
    where: { id: recipientId },
    select: { email: true },
  });
  if (!recipient) return;

  const messagesPath = isCustomer
    ? `/usta/mesajlar/${conversationId}`
    : `/musteri/mesajlar/${conversationId}`;

  await notifyMessageReceived({
    recipientId,
    recipientEmail: recipient.email,
    senderName: isCustomer
      ? conversation.customer.fullName
      : conversation.provider.user.fullName,
    preview,
    link: `${appUrl()}${messagesPath}`,
  });
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result) return jsonError("Konuşma bulunamadı", 404);

    const after = new URL(request.url).searchParams.get("after");

    let messages = await db.message.findMany({
      where: {
        conversationId: id,
        ...(after ? { createdAt: { gt: new Date(after) } } : {}),
      },
      orderBy: { createdAt: after ? "asc" : "desc" },
      include: { privateOffer: true },
      ...(after ? {} : { take: 100 }),
    });

    if (!after) messages = messages.reverse();

    return jsonSuccess({
      messages: messages.map(serializeMessage),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const limited = await enforceRateLimit(
      request,
      `messages:${user!.id}`,
      60,
      60,
    );
    if (limited) return limited;

    const { id } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result) return jsonError("Konuşma bulunamadı", 404);

    const contentType = request.headers.get("content-type") ?? "";
    let messageType: MessageType = MessageType.TEXT;
    let messageBody: string;
    let notifyPreview: string;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const image = form.get("image");

      if (!(image instanceof File) || image.size === 0) {
        return jsonError("Görsel seçin", 400);
      }

      try {
        messageBody = await saveMessageImage(id, image);
      } catch (uploadErr) {
        const msg =
          uploadErr instanceof Error ? uploadErr.message : "Yükleme hatası";
        return jsonError(msg, 400);
      }

      messageType = MessageType.IMAGE;
      notifyPreview = "Bir fotoğraf gönderdi";
    } else {
      const data = sendMessageSchema.parse(await request.json());
      const safety = validateMessageBody(data.body);
      if (!safety.ok) return jsonError(safety.reason!, 400);

      messageBody = data.body.trim();
      notifyPreview = messageBody;
    }

    const message = await db.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId: id,
          senderId: user!.id,
          type: messageType,
          body: messageBody,
        },
        include: { privateOffer: true },
      });
      await tx.conversation.update({
        where: { id },
        data: { lastMessageAt: created.createdAt },
      });
      return created;
    });

    await notifyRecipient(result, id, notifyPreview);

    return jsonSuccess({ message: serializeMessage(message) }, 201);
  } catch (err) {
    if (err instanceof StorageConfigError) {
      return jsonError(err.message, 503);
    }
    return handleApiError(err);
  }
}
