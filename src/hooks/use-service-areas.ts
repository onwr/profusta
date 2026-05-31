"use client";

import { useCallback, useEffect, useState } from "react";
import type { ResolvedServiceArea } from "@/lib/settings/service-areas-types";
import type { ProvinceData, TownData } from "@/lib/geo/turkey";

function areasToProvinces(areas: ResolvedServiceArea[]): ProvinceData[] {
  const map = new Map<string, ProvinceData>();

  for (const a of areas) {
    let p = map.get(a.provinceSlug);
    if (!p) {
      p = {
        id: 0,
        name: a.city,
        slug: a.provinceSlug,
        lat: a.lat,
        lng: a.lng,
        towns: [],
      };
      map.set(a.provinceSlug, p);
    }
    const town: TownData = {
      name: a.district,
      slug: a.townSlug,
      lat: a.lat,
      lng: a.lng,
    };
    if (!p.towns.some((t) => t.slug === town.slug)) {
      p.towns.push(town);
    }
  }

  return [...map.values()]
    .map((p) => ({
      ...p,
      towns: p.towns.sort((a, b) => a.name.localeCompare(b.name, "tr")),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export function useServiceAreas() {
  const [areas, setAreas] = useState<ResolvedServiceArea[]>([]);
  const [provinces, setProvinces] = useState<ProvinceData[]>([]);
  const [hasAreas, setHasAreas] = useState(true);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/geo/service-areas");
      if (!res.ok) return;
      const data = await res.json();
      const list = (data.areas ?? []) as ResolvedServiceArea[];
      setAreas(list);
      setProvinces(areasToProvinces(list));
      setHasAreas(data.hasAreas ?? list.length > 0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { areas, provinces, hasAreas, loading, reload };
}
