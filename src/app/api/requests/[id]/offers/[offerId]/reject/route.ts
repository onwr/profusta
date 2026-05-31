import { OfferStatus, RequestStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string; offerId: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id, offerId } = await params;
    const request = await db.serviceRequest.findFirst({
      where: { id, customerId: user!.id, status: RequestStatus.OPEN },
    });
    if (!request) return jsonError("Talep bulunamadı", 404);

    const offer = await db.offer.findFirst({
      where: { id: offerId, requestId: id, status: OfferStatus.PENDING },
    });
    if (!offer) return jsonError("Teklif bulunamadı", 404);

    const updated = await db.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.REJECTED },
    });

    return jsonSuccess({ offer: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
