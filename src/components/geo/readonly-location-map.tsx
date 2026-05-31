"use client";

import dynamic from "next/dynamic";

const LocationMap = dynamic(
  () =>
    import("@/components/geo/location-map").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[240px] items-center justify-center rounded-2xl border border-black/10 bg-[#f4f7f6] text-sm text-[#53635f]">
        Harita yükleniyor...
      </div>
    ),
  },
);

export function ReadonlyLocationMap({
  latitude,
  longitude,
  radiusKm,
  heightClass = "h-[240px]",
}: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  heightClass?: string;
}) {
  return (
    <LocationMap
      latitude={latitude}
      longitude={longitude}
      mode="readonly"
      heightClass={heightClass}
      radiusKm={radiusKm}
    />
  );
}
