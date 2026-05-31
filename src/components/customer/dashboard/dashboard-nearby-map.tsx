"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, LocateFixed, MapPin, Navigation } from "lucide-react";
import {
  DashboardCard,
  dashboardWidgetBodyClass,
} from "@/components/customer/dashboard/dashboard-card";
import type { DashboardProviderCard } from "@/lib/customer/dashboard-data";
import { cn } from "@/lib/utils";

const NearbyMapInner = dynamic(
  () => import("@/components/customer/dashboard/nearby-map-inner"),
  {
    ssr: false,
    loading: () => <MapLoading />,
  }
);

type Props = {
  centerLat: number;
  centerLng: number;
  providers: DashboardProviderCard[];
  nearestProviderKm: number | null;
  locationLabel: string;
  fill?: boolean;
  className?: string;
};

export function DashboardNearbyMap({
  centerLat,
  centerLng,
  providers,
  nearestProviderKm,
  locationLabel,
  fill,
  className,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [flyToCenter, setFlyToCenter] = useState<[number, number] | null>(null);
  const [userMarker, setUserMarker] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => setMounted(true), []);

  function locateMe() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserMarker(next);
        setFlyToCenter(next);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <DashboardCard
      title="Konum ve Yakındaki Ustalar"
      href="/ustalar"
      fill={fill}
      className={className}
    >
      <div className={cn(fill && dashboardWidgetBodyClass, "gap-4")}>
      <div className="flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-[24px] border border-black/5 bg-[#FBFDF5] p-2">
        <div className="relative min-h-[200px] flex-1 overflow-hidden rounded-[20px]">
          {mounted ? (
            <NearbyMapInner
              centerLat={centerLat}
              centerLng={centerLng}
              providers={providers}
              className="absolute inset-0 h-full w-full"
              flyToCenter={flyToCenter}
              userMarker={userMarker ?? undefined}
            />
          ) : (
            <MapLoading className="absolute inset-0 h-full min-h-[200px]" />
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/50 to-transparent" />

          <div className="absolute left-4 top-4 rounded-full bg-white px-4 py-2 text-xs font-black text-[#087a61] shadow-[0_10px_24px_rgba(8,50,40,0.12)]">
            {providers.length} usta bulundu
          </div>

          <button
            type="button"
            onClick={locateMe}
            disabled={locating}
            aria-label="Konumumu bul"
            title="Konumumu bul"
            className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#087a61] shadow-[0_12px_28px_rgba(8,50,40,0.16)] transition hover:bg-[#eef8f5] disabled:opacity-60"
          >
            <LocateFixed className={cn("h-5 w-5", locating && "animate-pulse")} />
          </button>
        </div>
      </div>

      <div className="shrink-0 rounded-[22px] bg-[#FBFDF5] p-4">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <MapPin className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#083228]">
              {nearestProviderKm != null
                ? `Size en yakın usta ${nearestProviderKm} km uzaklıkta`
                : "Yakınınızdaki ustalar haritada gösterilir"}
            </p>

            {locationLabel ? (
              <p className="mt-1 text-xs leading-5 text-[#53635f]">
                {locationLabel}
              </p>
            ) : null}
          </div>

          <Link
            href="/ustalar"
            className="hidden items-center gap-1 text-xs font-black text-[#087a61] sm:flex"
          >
            Haritayı Aç
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
      </div>
    </DashboardCard>
  );
}

function MapLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[20px] bg-[#f4f7f6] text-sm font-medium text-[#53635f]",
        className ?? "h-[260px]",
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#087a61] shadow-sm">
          <Navigation className="h-5 w-5 animate-pulse" />
        </div>
        Harita yükleniyor...
      </div>
    </div>
  );
}