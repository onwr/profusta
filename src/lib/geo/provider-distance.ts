import { haversineKm, roundDistanceKm } from "@/lib/geo/haversine";
import { normalizeLocation } from "@/lib/geo/turkey";

type ProviderCoords = {
  baseLatitude: number | null;
  baseLongitude: number | null;
  baseCity: string | null;
  baseDistrict: string | null;
};

type RequestPoint = {
  latitude: number;
  longitude: number;
  city: string;
  district?: string | null;
};

export function computeProviderDistanceKm(
  request: RequestPoint,
  provider: ProviderCoords,
  matchDistanceKm?: number | null,
): number | null {
  if (matchDistanceKm != null) {
    return roundDistanceKm(matchDistanceKm);
  }

  if (provider.baseLatitude != null && provider.baseLongitude != null) {
    return roundDistanceKm(
      haversineKm(
        request.latitude,
        request.longitude,
        provider.baseLatitude,
        provider.baseLongitude,
      ),
    );
  }

  if (provider.baseCity) {
    const reqCity = normalizeLocation(request.city);
    const baseCity = normalizeLocation(provider.baseCity);
    if (reqCity === baseCity) {
      const reqDistrict = request.district
        ? normalizeLocation(request.district)
        : null;
      const baseDistrict = provider.baseDistrict
        ? normalizeLocation(provider.baseDistrict)
        : null;
      if (!baseDistrict || !reqDistrict || baseDistrict === reqDistrict) {
        return 0;
      }
    }
  }

  return null;
}
