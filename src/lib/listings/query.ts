import { ListingStatus } from "@/generated/prisma/client";
import { haversineKm } from "@/lib/geo/haversine";
import { db } from "@/lib/db";

export type ListingListParams = {
  categoryId?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  sort?: "price_asc" | "price_desc" | "distance";
};

export async function getActiveListings(params: ListingListParams) {
  const listings = await db.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(params.city
        ? { city: { contains: params.city } }
        : {}),
      ...(params.district
        ? { district: { contains: params.district } }
        : {}),
      ...(params.minPrice != null || params.maxPrice != null
        ? {
            price: {
              ...(params.minPrice != null ? { gte: params.minPrice } : {}),
              ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      provider: {
        include: { user: { select: { fullName: true } } },
      },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  let result = listings.map((l) => ({
    ...l,
    distanceKm:
      params.lat != null && params.lng != null
        ? Math.round(
            haversineKm(params.lat, params.lng, l.latitude, l.longitude) * 10,
          ) / 10
        : undefined,
    ratingAvg: null as number | null,
    reviewCount: 0,
  }));

  if (params.sort === "price_asc") {
    result.sort((a, b) => a.price - b.price);
  } else if (params.sort === "price_desc") {
    result.sort((a, b) => b.price - a.price);
  } else if (params.sort === "distance" && params.lat != null) {
    result.sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
    );
  }

  return result;
}
