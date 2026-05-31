"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, MapPin, Navigation } from "lucide-react";
import { useUserLocation } from "@/hooks/use-user-location";
import type { ResolvedServiceArea } from "@/lib/settings/service-areas-types";
import { cn } from "@/lib/utils";

type ServiceAreasResponse = {
  areas: ResolvedServiceArea[];
  default: ResolvedServiceArea | null;
  hasAreas: boolean;
};

type Props = {
  className?: string;
  variant?: "desktop" | "mobile";
};

export function HeaderLocationPicker({
  className,
  variant = "desktop",
}: Props) {
  const { location, saveRegion, requestLocation, loading, error, initialized } =
    useUserLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"province" | "town">("province");
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [areas, setAreas] = useState<ResolvedServiceArea[]>([]);
  const [hasAreas, setHasAreas] = useState(true);
  const [search, setSearch] = useState("");

  const loadAreas = useCallback(async () => {
    const res = await fetch("/api/geo/service-areas");
    if (!res.ok) return;
    const data = (await res.json()) as ServiceAreasResponse;
    setAreas(data.areas ?? []);
    setHasAreas(data.hasAreas ?? false);
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  const provinces = useMemo(() => {
    const map = new Map<string, { slug: string; name: string }>();
    for (const a of areas) {
      if (!map.has(a.provinceSlug)) {
        map.set(a.provinceSlug, { slug: a.provinceSlug, name: a.city });
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [areas]);

  const townsForProvince = useMemo(() => {
    if (!selectedProvince) return [];
    return areas
      .filter((a) => a.provinceSlug === selectedProvince)
      .sort((a, b) => a.district.localeCompare(b.district, "tr"));
  }, [areas, selectedProvince]);

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q || step !== "province") return provinces;
    return provinces.filter((p) => p.name.toLocaleLowerCase("tr-TR").includes(q));
  }, [provinces, search, step]);

  const filteredTowns = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q || step !== "town") return townsForProvince;
    return townsForProvince.filter((t) =>
      t.district.toLocaleLowerCase("tr-TR").includes(q),
    );
  }, [townsForProvince, search, step]);

  function selectTown(area: ResolvedServiceArea) {
    saveRegion(area);
    setOpen(false);
    setStep("province");
    setSelectedProvince(null);
    setSearch("");
  }

  function openPicker() {
    setOpen(true);
    setStep("province");
    setSelectedProvince(null);
    setSearch("");
  }

  const label =
    initialized && location?.city && location?.district
      ? `${location.city}, ${location.district}`
      : initialized && location?.label
        ? location.label
        : "Konum seçin";

  const buttonClass =
    variant === "mobile"
      ? "flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#083228] ring-1 ring-black/10"
      : "inline-flex h-10 max-w-[220px] items-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-[#083228] transition hover:border-[#087a61]/30 hover:bg-[#eef8f5]";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={openPicker}
        className={buttonClass}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-[#087a61]" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-[#7b8b87] transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "absolute z-50 mt-2 rounded-2xl border border-black/5 bg-white shadow-lg",
              variant === "mobile" ? "left-0 right-0" : "right-0 w-80",
            )}
          >
            <div className="border-b border-black/5 p-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={step === "province" ? "İl ara..." : "İlçe ara..."}
                className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#087a61]/40"
              />
              <button
                type="button"
                disabled={loading || !hasAreas}
                onClick={() => {
                  requestLocation();
                  setOpen(false);
                }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#eef8f5] px-3 py-2 text-xs font-bold text-[#087a61] hover:bg-[#dff3ec] disabled:opacity-50"
              >
                <Navigation className="h-3.5 w-3.5" />
                Konumumu kullan
              </button>
              {error ? (
                <p className="mt-2 text-xs text-red-600">{error}</p>
              ) : null}
            </div>

            {!hasAreas ? (
              <p className="px-4 py-6 text-center text-sm text-[#53635f]">
                Henüz hizmet bölgesi tanımlanmadı.
              </p>
            ) : step === "province" ? (
              <ul className="max-h-64 overflow-y-auto py-1">
                {filteredProvinces.map((p) => (
                  <li key={p.slug}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProvince(p.slug);
                        setStep("town");
                        setSearch("");
                      }}
                      className="block w-full px-4 py-2.5 text-left text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                    >
                      {p.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("province");
                    setSelectedProvince(null);
                    setSearch("");
                  }}
                  className="w-full px-4 py-2 text-left text-xs font-bold text-[#087a61] hover:underline"
                >
                  ← İllere dön
                </button>
                <ul className="max-h-64 overflow-y-auto py-1">
                  {filteredTowns.map((t) => (
                    <li key={`${t.provinceSlug}-${t.townSlug}`}>
                      <button
                        type="button"
                        onClick={() => selectTown(t)}
                        className={cn(
                          "block w-full px-4 py-2.5 text-left text-sm hover:bg-[#eef8f5]",
                          location?.townSlug === t.townSlug &&
                            location?.provinceSlug === t.provinceSlug &&
                            "bg-[#eef8f5] font-bold text-[#087a61]",
                        )}
                      >
                        {t.district}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
