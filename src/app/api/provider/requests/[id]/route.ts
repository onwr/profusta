import { OfferStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const match = await db.requestProviderMatch.findUnique({
      where: {
        requestId_providerId: { requestId: id, providerId: provider.id },
      },
      include: {
        request: {
          include: {
            category: { select: { name: true, slug: true } },
            service: { select: { name: true } },
            customer: { select: { fullName: true } },
            images: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    if (!match) return jsonError("Talep bulunamadı", 404);

    const myOffer = await db.offer.findUnique({
      where: {
        requestId_providerId: {
          requestId: id,
          providerId: provider.id,
        },
      },
    });

    const { customer, ...requestRest } = match.request;

    return jsonSuccess({
      request: {
        ...requestRest,
        distanceKm: match.distanceKm,
        latitude: match.request.latitude,
        longitude: match.request.longitude,
        customerName: customer.fullName,
      },
      myOffer: myOffer?.status !== OfferStatus.WITHDRAWN ? myOffer : null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
