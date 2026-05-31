import { ProviderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { haversineKm, roundDistanceKm } from "@/lib/geo/haversine";
import { normalizeLocation } from "@/lib/geo/turkey";

type MatchInput = {
  categorySlug: string;
  latitude: number;
  longitude: number;
  city: string;
  district?: string | null;
};

export type ProviderMatch = {
  providerId: string;
  distanceKm: number;
};

export async function matchProvidersForRequest(
  input: MatchInput,
): Promise<ProviderMatch[]> {
  const providers = await db.provider.findMany({
    where: {
      status: ProviderStatus.APPROVED,
      categories: { some: { categorySlug: input.categorySlug } },
    },
    include: {
      serviceAreas: { where: { isActive: true } },
    },
  });

  const matches: ProviderMatch[] = [];
  const reqCity = normalizeLocation(input.city);
  const reqDistrict = input.district
    ? normalizeLocation(input.district)
    : null;

  for (const provider of providers) {
    let bestDistance: number | null = null;

    if (provider.baseLatitude != null && provider.baseLongitude != null) {
      const d = haversineKm(
        input.latitude,
        input.longitude,
        provider.baseLatitude,
        provider.baseLongitude,
      );
      const radius = provider.serviceRadiusKm ?? 20;
      if (d <= radius) {
        bestDistance = bestDistance == null ? d : Math.min(bestDistance, d);
      }
    }

    for (const area of provider.serviceAreas) {
      if (area.latitude != null && area.longitude != null) {
        const d = haversineKm(
          input.latitude,
          input.longitude,
          area.latitude,
          area.longitude,
        );
        if (d <= area.radiusKm) {
          bestDistance = bestDistance == null ? d : Math.min(bestDistance, d);
        }
      } else {
        const areaCity = normalizeLocation(area.city);
        const areaDistrict = area.district
          ? normalizeLocation(area.district)
          : null;
        if (
          areaCity === reqCity &&
          (!areaDistrict || !reqDistrict || areaDistrict === reqDistrict)
        ) {
          bestDistance = bestDistance ?? 0;
        }
      }
    }

    if (bestDistance == null && provider.baseCity) {
      const baseCity = normalizeLocation(provider.baseCity);
      const baseDistrict = provider.baseDistrict
        ? normalizeLocation(provider.baseDistrict)
        : null;
      if (
        baseCity === reqCity &&
        (!baseDistrict || !reqDistrict || baseDistrict === reqDistrict)
      ) {
        bestDistance = 0;
      }
    }

    if (bestDistance != null) {
      matches.push({
        providerId: provider.id,
        distanceKm: roundDistanceKm(bestDistance),
      });
    }
  }

  if (matches.length === 0) {
    for (const provider of providers) {
      const providerCity = provider.baseCity
        ? normalizeLocation(provider.baseCity)
        : null;
      const inSameCity =
        providerCity === reqCity ||
        provider.serviceAreas.some(
          (area) => normalizeLocation(area.city) === reqCity,
        );

      if (inSameCity) {
        matches.push({
          providerId: provider.id,
          distanceKm: 0,
        });
      }
    }
  }

  if (matches.length === 0) {
    for (const provider of providers) {
      matches.push({
        providerId: provider.id,
        distanceKm: 999,
      });
    }
  }

  matches.sort((a, b) => a.distanceKm - b.distanceKm);
  return matches;
}
