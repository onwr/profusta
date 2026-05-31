import { OfferStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await db.provider.findUnique({
      where: { userId: user!.id },
    });
    if (!provider) {
      return jsonSuccess({ requests: [] });
    }

    const matches = await db.requestProviderMatch.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      include: {
        request: {
          include: {
            category: { select: { name: true, slug: true } },
            service: { select: { name: true } },
            customer: { select: { fullName: true } },
            images: { take: 1, orderBy: { sortOrder: "asc" } },
            offers: {
              where: { providerId: provider.id },
              take: 1,
              select: { id: true, status: true, price: true },
            },
          },
        },
      },
    });

    const requests = matches.map((m) => {
      const offer = m.request.offers[0];
      const myOffer =
        offer && offer.status !== OfferStatus.WITHDRAWN
          ? {
              id: offer.id,
              status: offer.status,
              price: offer.price,
            }
          : null;

      return {
        id: m.request.id,
        status: m.request.status,
        city: m.request.city,
        district: m.request.district,
        neighborhood: m.request.neighborhood,
        description: m.request.description,
        preferredDate: m.request.preferredDate,
        preferredTime: m.request.preferredTime,
        createdAt: m.request.createdAt,
        distanceKm: m.distanceKm,
        matchId: m.id,
        category: m.request.category,
        service: m.request.service,
        customerName: m.request.customer.fullName,
        imageUrl: m.request.images[0]?.url ?? null,
        myOffer,
      };
    });

    return jsonSuccess({ requests });
  } catch (err) {
    return handleApiError(err);
  }
}
