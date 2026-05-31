import { OfferStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const offer = await db.offer.findFirst({
      where: { id, providerId: provider.id, status: OfferStatus.PENDING },
    });
    if (!offer) return jsonError("Teklif bulunamadı", 404);

    const updated = await db.offer.update({
      where: { id },
      data: { status: OfferStatus.WITHDRAWN },
    });

    return jsonSuccess({ offer: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
