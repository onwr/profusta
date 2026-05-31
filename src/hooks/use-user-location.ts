"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EVENT_LOCATION_CHANGED,
  STORAGE_USER_LOCATION,
} from "@/lib/constants";
import type { ResolvedServiceArea } from "@/lib/settings/service-areas-types";

export type UserLocation = {
  city: string;
  district: string;
  provinceSlug: string;
  townSlug: string;
  lat: number;
  lng: number;
  label: string;
  updatedAt: string;
};

function parseStored(raw: string | null): UserLocation | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<UserLocation>;
    if (
      typeof data.lat === "number" &&
      typeof data.lng === "number" &&
      Number.isFinite(data.lat) &&
      Number.isFinite(data.lng)
    ) {
      if (data.city && data.district && data.provinceSlug && data.townSlug) {
        return {
          city: data.city,
          district: data.district,
          provinceSlug: data.provinceSlug,
          townSlug: data.townSlug,
          lat: data.lat,
          lng: data.lng,
          label: data.label ?? `${data.city}, ${data.district}`,
          updatedAt: data.updatedAt ?? new Date().toISOString(),
        };
      }
      return {
        city: data.city ?? "",
        district: data.district ?? "",
        provinceSlug: data.provinceSlug ?? "",
        townSlug: data.townSlug ?? "",
        lat: data.lat,
        lng: data.lng,
        label: data.label ?? "Konumum",
        updatedAt: data.updatedAt ?? new Date().toISOString(),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function areaToLocation(area: ResolvedServiceArea): UserLocation {
  return {
    city: area.city,
    district: area.district,
    provinceSlug: area.provinceSlug,
    townSlug: area.townSlug,
    lat: area.lat,
    lng: area.lng,
    label: `${area.city}, ${area.district}`,
    updatedAt: new Date().toISOString(),
  };
}

function persistLocation(entry: UserLocation) {
  sessionStorage.setItem(STORAGE_USER_LOCATION, JSON.stringify(entry));
  window.dispatchEvent(new CustomEvent(EVENT_LOCATION_CHANGED, { detail: entry }));
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const loadDefaultFromApi = useCallback(async () => {
    const res = await fetch("/api/geo/service-areas");
    if (!res.ok) return null;
    const data = await res.json();
    if (data.default) {
      return areaToLocation(data.default as ResolvedServiceArea);
    }
    return null;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = parseStored(sessionStorage.getItem(STORAGE_USER_LOCATION));
    if (stored?.city && stored?.district) {
      setLocation(stored);
      setInitialized(true);
      return;
    }

    loadDefaultFromApi().then((defaultLoc) => {
      if (defaultLoc) {
        persistLocation(defaultLoc);
        setLocation(defaultLoc);
      }
      setInitialized(true);
    });
  }, [loadDefaultFromApi]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    function onChanged(e: Event) {
      const detail = (e as CustomEvent<UserLocation>).detail;
      if (detail) setLocation(detail);
      else {
        setLocation(parseStored(sessionStorage.getItem(STORAGE_USER_LOCATION)));
      }
    }

    window.addEventListener(EVENT_LOCATION_CHANGED, onChanged);
    return () => window.removeEventListener(EVENT_LOCATION_CHANGED, onChanged);
  }, []);

  const saveRegion = useCallback((area: ResolvedServiceArea) => {
    const entry = areaToLocation(area);
    persistLocation(entry);
    setLocation(entry);
    setError(null);
    return entry;
  }, []);

  const saveLocation = useCallback((lat: number, lng: number, label = "Konumum") => {
    const entry: UserLocation = {
      city: "",
      district: "",
      provinceSlug: "",
      townSlug: "",
      lat,
      lng,
      label,
      updatedAt: new Date().toISOString(),
    };
    persistLocation(entry);
    setLocation(entry);
    setError(null);
    return entry;
  }, []);

  const requestLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Tarayıcınız konum desteklemiyor");
      return Promise.resolve(null);
    }

    setLoading(true);
    setError(null);

    return new Promise<UserLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          try {
            const res = await fetch("/api/geo/service-areas");
            if (res.ok) {
              const data = await res.json();
              const areas = (data.areas ?? []) as ResolvedServiceArea[];
              if (areas.length > 0) {
                const { haversineKm } = await import("@/lib/geo/haversine");
                let best = areas[0];
                let bestKm = haversineKm(lat, lng, best.lat, best.lng);
                for (let i = 1; i < areas.length; i++) {
                  const km = haversineKm(lat, lng, areas[i].lat, areas[i].lng);
                  if (km < bestKm) {
                    bestKm = km;
                    best = areas[i];
                  }
                }
                const entry = saveRegion(best);
                setLoading(false);
                resolve(entry);
                return;
              }
            }
          } catch {
            /* fallback coords only */
          }

          const entry = saveLocation(lat, lng);
          setLoading(false);
          resolve(entry);
        },
        (err) => {
          setLoading(false);
          if (err.code === err.PERMISSION_DENIED) {
            setError("Konum izni reddedildi");
          } else {
            setError("Konum alınamadı");
          }
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    });
  }, [saveLocation, saveRegion]);

  const clearLocation = useCallback(() => {
    sessionStorage.removeItem(STORAGE_USER_LOCATION);
    setLocation(null);
    window.dispatchEvent(new CustomEvent(EVENT_LOCATION_CHANGED));
  }, []);

  return {
    location,
    loading,
    error,
    initialized,
    requestLocation,
    saveLocation,
    saveRegion,
    clearLocation,
    loadDefaultFromApi,
  };
}
