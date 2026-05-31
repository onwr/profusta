import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getConversationForUser, getOtherPartyName } from "@/lib/conversations/access";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const result = await getConversationForUser(id, user!);
    if (!result) return jsonError("Konuşma bulunamadı", 404);

    const { conversation, isCustomer } = result;

    return jsonSuccess({
      conversation: {
        id: conversation.id,
        listing: conversation.listing
          ? {
              ...conversation.listing,
              createdAt: conversation.listing.createdAt.toISOString(),
            }
          : null,
        otherName: getOtherPartyName(conversation, isCustomer),
        otherAvatarUrl: isCustomer
          ? conversation.provider.user.avatarUrl
          : conversation.customer.avatarUrl,
        latestOffer: conversation.privateOffers[0]
          ? {
              ...conversation.privateOffers[0],
              createdAt: conversation.privateOffers[0].createdAt.toISOString(),
              scheduledAt:
                conversation.privateOffers[0].scheduledAt?.toISOString() ?? null,
            }
          : null,
        isCustomer,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
