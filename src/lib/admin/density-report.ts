import { ListingStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { normalizeLocation } from "@/lib/geo/turkey";

export type DensityRow = {
  city: string;
  district: string;
  requestCount: number;
  listingCount: number;
  total: number;
};

export async function getServiceDensityReport(): Promise<DensityRow[]> {
  const [requests, listings] = await Promise.all([
    db.serviceRequest.findMany({
      select: { city: true, district: true },
    }),
    db.listing.findMany({
      where: { status: ListingStatus.ACTIVE },
      select: { city: true, district: true },
    }),
  ]);

  const map = new Map<
    string,
    { city: string; district: string; requests: number; listings: number }
  >();

  function key(city: string, district: string | null) {
    return `${normalizeLocation(city)}|${normalizeLocation(district ?? "")}`;
  }

  for (const r of requests) {
    const k = key(r.city, r.district);
    const row = map.get(k) ?? {
      city: r.city,
      district: r.district ?? "—",
      requests: 0,
      listings: 0,
    };
    row.requests += 1;
    map.set(k, row);
  }

  for (const l of listings) {
    const k = key(l.city, l.district);
    const row = map.get(k) ?? {
      city: l.city,
      district: l.district ?? "—",
      requests: 0,
      listings: 0,
    };
    row.listings += 1;
    map.set(k, row);
  }

  return Array.from(map.values())
    .map((r) => ({
      city: r.city,
      district: r.district,
      requestCount: r.requests,
      listingCount: r.listings,
      total: r.requests + r.listings,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 30);
}
