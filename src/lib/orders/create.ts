import {
  ListingStatus,
  OfferStatus,
  OrderSourceType,
  OrderStatus,
  PrivateOfferStatus,
  ProviderStatus,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { calcCommission, getCommissionRatePercent } from "@/lib/settings/commission";

const PAID_STATUSES: OrderStatus[] = [
  OrderStatus.PAID_ESCROW,
  OrderStatus.PROVIDER_ACCEPTED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED_BY_PROVIDER,
  OrderStatus.COMPLETED,
  OrderStatus.PAYOUT_PENDING,
  OrderStatus.PAYOUT_COMPLETED,
];

function generateMerchantOid(): string {
  return `PRF${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function assertNoPaidOrder(
  sourceType: OrderSourceType,
  sourceId: string,
) {
  const existing = await db.order.findFirst({
    where: {
      sourceType,
      sourceId,
      status: { in: PAID_STATUSES },
    },
  });
  if (existing) {
    return { ok: false as const, error: "Bu kaynak için ödeme tamamlanmış sipariş var", status: 409 };
  }
  return { ok: true as const };
}

export async function createOrderFromSource(params: {
  customerId: string;
  sourceType: OrderSourceType;
  sourceId: string;
}) {
  const dup = await assertNoPaidOrder(params.sourceType, params.sourceId);
  if (!dup.ok) return dup;

  const pending = await db.order.findFirst({
    where: {
      sourceType: params.sourceType,
      sourceId: params.sourceId,
      customerId: params.customerId,
      status: OrderStatus.PENDING_PAYMENT,
    },
  });
  if (pending) {
    return { ok: true as const, order: pending, created: false };
  }

  const rate = await getCommissionRatePercent();

  if (params.sourceType === OrderSourceType.REQUEST_OFFER) {
    const offer = await db.offer.findFirst({
      where: {
        id: params.sourceId,
        status: OfferStatus.ACCEPTED,
        request: { customerId: params.customerId },
      },
      include: {
        request: { include: { category: true } },
        provider: true,
      },
    });
    if (!offer) {
      return { ok: false as const, error: "Kabul edilmiş teklif bulunamadı", status: 404 };
    }
    if (offer.provider.status !== ProviderStatus.APPROVED) {
      return { ok: false as const, error: "Usta onaylı değil", status: 400 };
    }
    const { commissionAmount, netAmount } = calcCommission(offer.price, rate);
    const order = await db.order.create({
      data: {
        merchantOid: generateMerchantOid(),
        customerId: params.customerId,
        providerId: offer.providerId,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        requestOfferId: offer.id,
        title: `${offer.request.category.name} hizmeti`,
        description: offer.description,
        amount: offer.price,
        commissionRate: rate,
        commissionAmount,
        netAmount,
      },
    });
    return { ok: true as const, order, created: true };
  }

  if (params.sourceType === OrderSourceType.PRIVATE_OFFER) {
    const offer = await db.privateOffer.findFirst({
      where: {
        id: params.sourceId,
        status: PrivateOfferStatus.ACCEPTED,
        conversation: { customerId: params.customerId },
      },
      include: {
        conversation: { include: { provider: true } },
      },
    });
    if (!offer) {
      return { ok: false as const, error: "Kabul edilmiş özel teklif bulunamadı", status: 404 };
    }
    if (offer.conversation.provider.status !== ProviderStatus.APPROVED) {
      return { ok: false as const, error: "Usta onaylı değil", status: 400 };
    }
    const { commissionAmount, netAmount } = calcCommission(offer.price, rate);
    const order = await db.order.create({
      data: {
        merchantOid: generateMerchantOid(),
        customerId: params.customerId,
        providerId: offer.conversation.providerId,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        privateOfferId: offer.id,
        title: offer.title.trim() || "Özel teklif",
        description: offer.description,
        amount: offer.price,
        commissionRate: rate,
        commissionAmount,
        netAmount,
      },
    });
    return { ok: true as const, order, created: true };
  }

  if (params.sourceType === OrderSourceType.LISTING) {
    const listing = await db.listing.findFirst({
      where: {
        id: params.sourceId,
        status: ListingStatus.ACTIVE,
      },
      include: { provider: true, category: true },
    });
    if (!listing) {
      return { ok: false as const, error: "İlan bulunamadı", status: 404 };
    }
    if (listing.provider.status !== ProviderStatus.APPROVED) {
      return { ok: false as const, error: "Usta onaylı değil", status: 400 };
    }
    const { commissionAmount, netAmount } = calcCommission(listing.price, rate);
    const order = await db.order.create({
      data: {
        merchantOid: generateMerchantOid(),
        customerId: params.customerId,
        providerId: listing.providerId,
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        listingId: listing.id,
        title: listing.title,
        description: listing.description,
        amount: listing.price,
        commissionRate: rate,
        commissionAmount,
        netAmount,
      },
    });
    return { ok: true as const, order, created: true };
  }

  return { ok: false as const, error: "Geçersiz kaynak", status: 400 };
}
