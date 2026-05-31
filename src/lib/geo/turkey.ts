import turkeyRaw from "@/data/turkey-locations.json";

export type TownData = {
  name: string;
  slug: string;
  lat: number;
  lng: number;
};

export type ProvinceData = {
  id: number;
  name: string;
  slug: string;
  lat: number;
  lng: number;
  towns: TownData[];
};

type TownRaw = {
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
};

type ProvinceRaw = {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  towns: TownRaw[];
};

const rawProvinces = turkeyRaw as ProvinceRaw[];

const provinces: ProvinceData[] = rawProvinces.map((p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  lat: p.latitude,
  lng: p.longitude,
  towns: p.towns.map((t) => ({
    name: t.name,
    slug: t.slug,
    lat: t.latitude,
    lng: t.longitude,
  })),
}));

const provinceBySlug = new Map(provinces.map((p) => [p.slug, p]));
const provinceByNormName = new Map(
  provinces.map((p) => [normalizeLocation(p.name), p]),
);

export function normalizeLocation(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getProvinces(): ProvinceData[] {
  return provinces;
}

export function getDistricts(provinceName: string): string[] {
  const p = findProvince(provinceName);
  return p?.towns.map((t) => t.name) ?? [];
}

export function findProvince(name: string): ProvinceData | undefined {
  return provinceByNormName.get(normalizeLocation(name));
}

export function findProvinceBySlug(slug: string): ProvinceData | undefined {
  return provinceBySlug.get(slug);
}

export function findTown(
  cityName: string,
  districtName: string,
): TownData | undefined {
  const province = findProvince(cityName);
  if (!province) return undefined;
  const norm = normalizeLocation(districtName);
  return province.towns.find((t) => normalizeLocation(t.name) === norm);
}

export function findBySlugs(
  provinceSlug: string,
  townSlug: string,
): { province: ProvinceData; town: TownData } | undefined {
  const province = provinceBySlug.get(provinceSlug);
  if (!province) return undefined;
  const town = province.towns.find((t) => t.slug === townSlug);
  if (!town) return undefined;
  return { province, town };
}

export function getCentroid(
  city: string,
  district?: string | null,
): { lat: number; lng: number } | null {
  const province = findProvince(city);
  if (!province) return null;
  if (district) {
    const town = findTown(city, district);
    if (town) return { lat: town.lat, lng: town.lng };
  }
  return { lat: province.lat, lng: province.lng };
}

export const DEFAULT_MAP_CENTER = { lat: 39.9334, lng: 32.8597 };
