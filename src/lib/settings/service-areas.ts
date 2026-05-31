import { db } from "@/lib/db";
import {
  findBySlugs,
  findProvince,
  findProvinceBySlug,
  findTown,
  getProvinces,
  type ProvinceData,
} from "@/lib/geo/turkey";
import type {
  ResolvedServiceArea,
  ServiceAreasConfig,
} from "@/lib/settings/service-areas-types";

export type { ResolvedServiceArea, ServiceAreasConfig } from "@/lib/settings/service-areas-types";

export const SERVICE_AREAS_KEY = "service_areas";

const EMPTY_CONFIG: ServiceAreasConfig = { enabled: {} };

export const DEFAULT_SERVICE_AREAS: ServiceAreasConfig = {
  enabled: { istanbul: ["kadikoy"] },
};

export async function getServiceAreasConfig(): Promise<ServiceAreasConfig> {
  const row = await db.platformSetting.findUnique({
    where: { key: SERVICE_AREAS_KEY },
  });
  if (!row?.value) return { ...EMPTY_CONFIG };
  try {
    const parsed = JSON.parse(row.value) as ServiceAreasConfig;
    if (parsed && typeof parsed.enabled === "object") {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { ...EMPTY_CONFIG };
}

export async function setServiceAreasConfig(config: ServiceAreasConfig) {
  validateServiceAreasConfig(config);
  await db.platformSetting.upsert({
    where: { key: SERVICE_AREAS_KEY },
    create: { key: SERVICE_AREAS_KEY, value: JSON.stringify(config) },
    update: { value: JSON.stringify(config) },
  });
}

export function validateServiceAreasConfig(config: ServiceAreasConfig) {
  for (const [provinceSlug, townSlugs] of Object.entries(config.enabled)) {
    const province = findProvinceBySlug(provinceSlug);
    if (!province) {
      throw new Error(`Geçersiz il slug: ${provinceSlug}`);
    }
    if (!Array.isArray(townSlugs)) {
      throw new Error(`Geçersiz ilçe listesi: ${provinceSlug}`);
    }
    for (const townSlug of townSlugs) {
      const found = findBySlugs(provinceSlug, townSlug);
      if (!found) {
        throw new Error(`Geçersiz ilçe slug: ${provinceSlug}/${townSlug}`);
      }
    }
  }
}

export function isAreaEnabled(
  provinceSlug: string,
  townSlug: string,
  config: ServiceAreasConfig,
): boolean {
  const townSlugs = config.enabled[provinceSlug];
  if (!townSlugs) return false;
  if (townSlugs.length === 0) return true;
  return townSlugs.includes(townSlug);
}

export function isAreaEnabledByCityDistrict(
  city: string,
  district: string | null | undefined,
  config: ServiceAreasConfig,
): boolean {
  const province = findProvince(city);
  if (!province) return false;

  const townSlugs = config.enabled[province.slug];
  if (!townSlugs) return false;
  if (townSlugs.length === 0) return true;

  if (!district?.trim()) return false;
  const town = findTown(city, district);
  if (!town) return false;
  return townSlugs.includes(town.slug);
}

export function resolveEnabledAreas(
  config: ServiceAreasConfig,
): ResolvedServiceArea[] {
  const areas: ResolvedServiceArea[] = [];

  for (const [provinceSlug, townSlugs] of Object.entries(config.enabled)) {
    const province = findProvinceBySlug(provinceSlug);
    if (!province) continue;

    if (townSlugs.length === 0) {
      for (const town of province.towns) {
        areas.push({
          city: province.name,
          district: town.name,
          provinceSlug: province.slug,
          townSlug: town.slug,
          lat: town.lat,
          lng: town.lng,
        });
      }
    } else {
      for (const townSlug of townSlugs) {
        const found = findBySlugs(provinceSlug, townSlug);
        if (!found) continue;
        areas.push({
          city: found.province.name,
          district: found.town.name,
          provinceSlug: found.province.slug,
          townSlug: found.town.slug,
          lat: found.town.lat,
          lng: found.town.lng,
        });
      }
    }
  }

  return areas.sort((a, b) =>
    a.city.localeCompare(b.city, "tr") ||
    a.district.localeCompare(b.district, "tr"),
  );
}

export function getDefaultServiceArea(
  config: ServiceAreasConfig,
): ResolvedServiceArea | null {
  const areas = resolveEnabledAreas(config);
  if (areas.length > 0) return areas[0];

  const fallback = findBySlugs("istanbul", "kadikoy");
  if (fallback) {
    return {
      city: fallback.province.name,
      district: fallback.town.name,
      provinceSlug: fallback.province.slug,
      townSlug: fallback.town.slug,
      lat: fallback.town.lat,
      lng: fallback.town.lng,
    };
  }
  return null;
}

export function getEnabledProvincesForSelect(
  config: ServiceAreasConfig,
): ProvinceData[] {
  const all = getProvinces();
  return all
    .filter((p) => config.enabled[p.slug] != null)
    .map((p) => {
      const townSlugs = config.enabled[p.slug];
      if (townSlugs.length === 0) return p;
      const slugSet = new Set(townSlugs);
      return {
        ...p,
        towns: p.towns.filter((t) => slugSet.has(t.slug)),
      };
    })
    .filter((p) => p.towns.length > 0);
}

export function countEnabledAreas(config: ServiceAreasConfig): {
  provinceCount: number;
  townCount: number;
} {
  let townCount = 0;
  const provinceCount = Object.keys(config.enabled).length;
  for (const [provinceSlug, townSlugs] of Object.entries(config.enabled)) {
    const province = findProvinceBySlug(provinceSlug);
    if (!province) continue;
    townCount +=
      townSlugs.length === 0 ? province.towns.length : townSlugs.length;
  }
  return { provinceCount, townCount };
}

export async function assertServiceAreaEnabled(
  city: string,
  district: string | null | undefined,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const config = await getServiceAreasConfig();
  const areas = resolveEnabledAreas(config);
  if (areas.length === 0) {
    return { ok: false, message: "Hizmet bölgesi tanımlı değil" };
  }
  if (!isAreaEnabledByCityDistrict(city, district, config)) {
    return {
      ok: false,
      message: "Bu bölgede henüz hizmet verilmiyor",
    };
  }
  return { ok: true };
}
