import { OfferStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { computeProviderDistanceKm } from "@/lib/geo/provider-distance";
import { serializeOfferForCustomer } from "@/lib/offers/serialize";
import { getProviderRating } from "@/lib/reviews/aggregate";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const sortParam = new URL(request.url).searchParams.get("sort");
    const sort = sortParam === "price" ? "price" : "distance";

    const serviceRequest = await db.serviceRequest.findFirst({
      where: { id, customerId: user!.id },
    });
    if (!serviceRequest) return jsonError("Talep bulunamadı", 404);

    const offers = await db.offer.findMany({
      where: {
        requestId: id,
        status: { not: OfferStatus.WITHDRAWN },
      },
      include: {
        provider: {
          include: {
            user: { select: { fullName: true, avatarUrl: true } },
            categories: true,
          },
        },
      },
    });

    const matches = await db.requestProviderMatch.findMany({
      where: { requestId: id },
    });
    const distanceMap = new Map(
      matches.map((m) => [m.providerId, m.distanceKm]),
    );

    const providerIds = [...new Set(offers.map((o) => o.providerId))];
    const ratingEntries = await Promise.all(
      providerIds.map(async (pid) => [pid, await getProviderRating(pid)] as const),
    );
    const ratingMap = new Map(ratingEntries);

    let serialized = offers.map((o) => {
      const distanceKm = computeProviderDistanceKm(
        serviceRequest,
        o.provider,
        distanceMap.get(o.providerId),
      );
      return serializeOfferForCustomer({
        ...o,
        distanceKm: distanceKm ?? undefined,
        providerRating: ratingMap.get(o.providerId),
      });
    });

    if (sort === "distance") {
      serialized = serialized.sort((a, b) => {
        const da = a.distanceKm ?? Infinity;
        const db_ = b.distanceKm ?? Infinity;
        return da - db_;
      });
    } else {
      serialized = serialized.sort((a, b) => a.price - b.price);
    }

    const accepted = offers.find((o) => o.status === OfferStatus.ACCEPTED);

    return jsonSuccess({
      offers: serialized,
      requestStatus: serviceRequest.status,
      acceptedOfferId: accepted?.id ?? null,
      sort,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
