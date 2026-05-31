import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getConversationForUser } from "@/lib/conversations/access";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result) return jsonError("Konuşma bulunamadı", 404);

    const otherUserId = result.isCustomer
      ? result.conversation.provider.user.id
      : result.conversation.customer.id;

    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: otherUserId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
