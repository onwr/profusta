import {
  OfferStatus,
  RequestStatus,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function getProviderForUser(userId: string) {
  return db.provider.findUnique({ where: { userId } });
}

export async function assertCanCreateOffer(
  requestId: string,
  providerId: string,
) {
  const request = await db.serviceRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    return { ok: false as const, error: "Talep bulunamadı", status: 404 };
  }
  if (request.status !== RequestStatus.OPEN) {
    return {
      ok: false as const,
      error: "Bu talep artık teklif kabul etmiyor",
      status: 400,
    };
  }

  const match = await db.requestProviderMatch.findUnique({
    where: {
      requestId_providerId: { requestId, providerId },
    },
  });
  if (!match) {
    return {
      ok: false as const,
      error: "Bu talep size atanmamış",
      status: 403,
    };
  }

  const existing = await db.offer.findUnique({
    where: {
      requestId_providerId: { requestId, providerId },
    },
  });
  if (existing && existing.status !== OfferStatus.WITHDRAWN) {
    return {
      ok: false as const,
      error: "Bu talebe zaten teklif verdiniz",
      status: 409,
    };
  }

  return { ok: true as const, request };
}

export async function acceptOffer(
  requestId: string,
  offerId: string,
  customerId: string,
) {
  const request = await db.serviceRequest.findFirst({
    where: { id: requestId, customerId },
  });
  if (!request) {
    return { ok: false as const, error: "Talep bulunamadı", status: 404 };
  }
  if (request.status !== RequestStatus.OPEN) {
    return {
      ok: false as const,
      error: "Bu talep için teklif kabul edilemez",
      status: 400,
    };
  }

  const offer = await db.offer.findFirst({
    where: { id: offerId, requestId, status: OfferStatus.PENDING },
  });
  if (!offer) {
    return { ok: false as const, error: "Teklif bulunamadı", status: 404 };
  }

  await db.$transaction([
    db.offer.update({
      where: { id: offerId },
      data: { status: OfferStatus.ACCEPTED },
    }),
    db.offer.updateMany({
      where: {
        requestId,
        id: { not: offerId },
        status: OfferStatus.PENDING,
      },
      data: { status: OfferStatus.REJECTED },
    }),
    db.serviceRequest.update({
      where: { id: requestId },
      data: { status: RequestStatus.OFFER_ACCEPTED },
    }),
  ]);

  return { ok: true as const, offer };
}

export const PROVIDER_RATING_PLACEHOLDER = {
  ratingAvg: null as number | null,
  reviewCount: 0,
};
