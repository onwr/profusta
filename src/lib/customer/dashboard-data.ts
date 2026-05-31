import {
  OfferStatus,
  OrderStatus,
  ProviderStatus,
  RequestStatus,
} from "@/generated/prisma/client";
import { getActiveCategories } from "@/lib/categories";
import { db } from "@/lib/db";
import { haversineKm, roundDistanceKm } from "@/lib/geo/haversine";
import { matchProvidersForRequest } from "@/lib/geo/match-providers";
import { getProviderRating } from "@/lib/reviews/aggregate";

const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.PAID_ESCROW,
  OrderStatus.PROVIDER_ACCEPTED,
  OrderStatus.IN_PROGRESS,
  OrderStatus.COMPLETED_BY_PROVIDER,
];

export type CustomerNavCounts = {
  pendingOffersCount: number;
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
};

export async function getCustomerNavCounts(
  userId: string,
): Promise<CustomerNavCounts> {
  const [pendingOffersCount, unreadMessagesCount, unreadNotificationsCount] =
    await Promise.all([
      db.offer.count({
        where: {
          status: OfferStatus.PENDING,
          request: {
            customerId: userId,
            status: RequestStatus.OPEN,
          },
        },
      }),
      db.message.count({
        where: {
          readAt: null,
          conversation: { customerId: userId },
          senderId: { not: userId },
        },
      }),
      db.notification.count({
        where: { userId, readAt: null },
      }),
    ]);

  return {
    pendingOffersCount,
    unreadMessagesCount,
    unreadNotificationsCount,
  };
}

export type DashboardProviderCard = {
  id: string;
  slug: string | null;
  fullName: string;
  baseCity: string | null;
  baseDistrict: string | null;
  distanceKm: number | null;
  ratingAvg: number | null;
  reviewCount: number;
  latitude: number | null;
  longitude: number | null;
  primaryCategorySlug: string | null;
};

export type CustomerDashboardData = {
  locationLabel: string;
  centerLat: number;
  centerLng: number;
  nearestProviderKm: number | null;
  categories: Awaited<ReturnType<typeof getActiveCategories>>;
  requests: {
    id: string;
    categoryName: string;
    city: string;
    district: string | null;
    createdAt: Date;
    offerCount: number;
    status: RequestStatus;
  }[];
  recentOffers: {
    id: string;
    requestId: string;
    price: number;
    categoryName: string;
    providerId: string;
    providerName: string;
    ratingAvg: number | null;
    reviewCount: number;
  }[];
  upcomingOrders: {
    id: string;
    title: string;
    status: OrderStatus;
    providerName: string;
    scheduledAt: Date | null;
    city: string | null;
    amount: number;
  }[];
  favorites: DashboardProviderCard[];
  recommended: DashboardProviderCard[];
  mapProviders: DashboardProviderCard[];
};

async function enrichProviders(
  providerIds: string[],
  centerLat: number,
  centerLng: number,
): Promise<DashboardProviderCard[]> {
  if (providerIds.length === 0) return [];

  const providers = await db.provider.findMany({
    where: { id: { in: providerIds }, status: ProviderStatus.APPROVED },
    include: {
      user: { select: { fullName: true } },
      categories: { take: 1 },
    },
  });

  const byId = new Map(providers.map((p) => [p.id, p]));

  const ordered = providerIds
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return Promise.all(
    ordered.map(async (p) => {
      const rating = await getProviderRating(p.id);
      let distanceKm: number | null = null;
      if (p.baseLatitude != null && p.baseLongitude != null) {
        distanceKm = roundDistanceKm(
          haversineKm(centerLat, centerLng, p.baseLatitude, p.baseLongitude),
        );
      }
      return {
        id: p.id,
        slug: p.slug,
        fullName: p.user.fullName,
        baseCity: p.baseCity,
        baseDistrict: p.baseDistrict,
        distanceKm,
        ratingAvg: rating.ratingAvg,
        reviewCount: rating.reviewCount,
        latitude: p.baseLatitude,
        longitude: p.baseLongitude,
        primaryCategorySlug: p.categories[0]?.categorySlug ?? null,
      };
    }),
  );
}

async function getRecommendedProviderIds(
  userId: string,
  centerLat: number,
  centerLng: number,
  city: string,
): Promise<string[]> {
  const lastRequest = await db.serviceRequest.findFirst({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    include: { category: { select: { slug: true } } },
  });

  if (lastRequest) {
    const matches = await matchProvidersForRequest({
      categorySlug: lastRequest.category.slug,
      latitude: lastRequest.latitude,
      longitude: lastRequest.longitude,
      city: lastRequest.city,
      district: lastRequest.district,
    });
    if (matches.length > 0) {
      return matches.slice(0, 6).map((m) => m.providerId);
    }
  }

  const fallback = await db.provider.findMany({
    where: {
      status: ProviderStatus.APPROVED,
      ...(city ? { baseCity: { contains: city } } : {}),
    },
    include: { user: { select: { fullName: true } } },
    take: 12,
    orderBy: { createdAt: "desc" },
  });

  const withDistance = fallback
    .map((p) => {
      let d = Infinity;
      if (p.baseLatitude != null && p.baseLongitude != null) {
        d = haversineKm(centerLat, centerLng, p.baseLatitude, p.baseLongitude);
      }
      return { id: p.id, d };
    })
    .sort((a, b) => a.d - b.d);

  return withDistance.slice(0, 6).map((p) => p.id);
}

export async function getCustomerDashboardData(
  userId: string,
): Promise<CustomerDashboardData> {
  const lastRequest = await db.serviceRequest.findFirst({
    where: { customerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      city: true,
      district: true,
      latitude: true,
      longitude: true,
    },
  });

  const centerLat = lastRequest?.latitude ?? 41.0082;
  const centerLng = lastRequest?.longitude ?? 28.9784;
  const city = lastRequest?.city ?? "İstanbul";
  const district = lastRequest?.district ?? null;
  const locationLabel = district ? `${city}, ${district}` : city;

  const [
    categories,
    requests,
    recentOffersRaw,
    upcomingOrdersRaw,
    favoritesRaw,
    recommendedIds,
  ] = await Promise.all([
    getActiveCategories(),
    db.serviceRequest.findMany({
      where: { customerId: userId, status: RequestStatus.OPEN },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        category: { select: { name: true } },
        _count: { select: { offers: true } },
      },
    }),
    db.offer.findMany({
      where: {
        status: OfferStatus.PENDING,
        request: {
          customerId: userId,
          status: RequestStatus.OPEN,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        provider: { include: { user: { select: { fullName: true } } } },
        request: { include: { category: { select: { name: true } } } },
      },
    }),
    db.order.findMany({
      where: {
        customerId: userId,
        status: { in: ACTIVE_ORDER_STATUSES },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        provider: { include: { user: { select: { fullName: true } } } },
        privateOffer: { select: { scheduledAt: true } },
        requestOffer: {
          include: {
            request: {
              select: {
                preferredDate: true,
                city: true,
                district: true,
              },
            },
          },
        },
      },
    }),
    db.favorite.findMany({
      where: { customerId: userId },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: {
        provider: {
          include: {
            user: { select: { fullName: true } },
            categories: { take: 1 },
          },
        },
      },
    }),
    getRecommendedProviderIds(userId, centerLat, centerLng, city),
  ]);

  const recentOffers = await Promise.all(
    recentOffersRaw.map(async (o) => {
      const rating = await getProviderRating(o.providerId);
      return {
        id: o.id,
        requestId: o.requestId,
        price: o.price,
        categoryName: o.request.category.name,
        providerId: o.providerId,
        providerName: o.provider.user.fullName,
        ratingAvg: rating.ratingAvg,
        reviewCount: rating.reviewCount,
      };
    }),
  );

  const upcomingOrders = upcomingOrdersRaw.map((o) => {
    const scheduledAt =
      o.privateOffer?.scheduledAt ??
      (o.requestOffer?.request.preferredDate
        ? new Date(o.requestOffer.request.preferredDate)
        : null);
    const req = o.requestOffer?.request;
    const orderCity = req
      ? req.district
        ? `${req.city}, ${req.district}`
        : req.city
      : null;

    return {
      id: o.id,
      title: o.title,
      status: o.status,
      providerName: o.provider.user.fullName,
      scheduledAt,
      city: orderCity,
      amount: o.amount,
    };
  });

  const favorites: DashboardProviderCard[] = await Promise.all(
    favoritesRaw.map(async (f) => {
      const rating = await getProviderRating(f.providerId);
      let distanceKm: number | null = null;
      const p = f.provider;
      if (p.baseLatitude != null && p.baseLongitude != null) {
        distanceKm = roundDistanceKm(
          haversineKm(centerLat, centerLng, p.baseLatitude, p.baseLongitude),
        );
      }
      return {
        id: p.id,
        slug: p.slug,
        fullName: p.user.fullName,
        baseCity: p.baseCity,
        baseDistrict: p.baseDistrict,
        distanceKm,
        ratingAvg: rating.ratingAvg,
        reviewCount: rating.reviewCount,
        latitude: p.baseLatitude,
        longitude: p.baseLongitude,
        primaryCategorySlug: p.categories[0]?.categorySlug ?? null,
      };
    }),
  );

  const recommended = await enrichProviders(
    recommendedIds,
    centerLat,
    centerLng,
  );

  const mapProviders = recommended.filter(
    (p) => p.latitude != null && p.longitude != null,
  );

  const mapDistances = mapProviders
    .map((p) => p.distanceKm)
    .filter((d): d is number => d != null);
  const nearestProviderKm =
    mapDistances.length > 0
      ? Math.min(...mapDistances)
      : recommended.find((p) => p.distanceKm != null)?.distanceKm ?? null;

  return {
    locationLabel,
    centerLat,
    centerLng,
    nearestProviderKm,
    categories,
    requests: requests.map((r) => ({
      id: r.id,
      categoryName: r.category.name,
      city: r.city,
      district: r.district,
      createdAt: r.createdAt,
      offerCount: r._count.offers,
      status: r.status,
    })),
    recentOffers,
    upcomingOrders,
    favorites,
    recommended,
    mapProviders,
  };
}
