"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MapPin,
  Search,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { areaSelectionKey } from "@/lib/validations/provider";
import { cn } from "@/lib/utils";

type AvailableArea = {
  city: string;
  district: string;
  provinceSlug: string;
  townSlug: string;
  lat: number;
  lng: number;
};

type SavedArea = {
  id: string;
  city: string;
  district: string | null;
  radiusKm: number;
  isActive: boolean;
};

type FilterKey = "all" | "selected" | "unselected";

export function ProviderAreasView() {
  const [available, setAvailable] = useState<AvailableArea[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [initialKeys, setInitialKeys] = useState<string[]>([]);
  const [defaultRadiusKm, setDefaultRadiusKm] = useState(20);
  const [initialRadiusKm, setInitialRadiusKm] = useState(20);
  const [hasPlatformAreas, setHasPlatformAreas] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    return fetch("/api/provider/areas")
      .then((r) => r.json())
      .then((data) => {
        setAvailable(data.available ?? []);
        setHasPlatformAreas(data.hasAreas ?? (data.available?.length > 0));
        const radius = data.defaultRadiusKm ?? 20;
        setDefaultRadiusKm(radius);
        setInitialRadiusKm(radius);

        const keys = ((data.areas ?? []) as SavedArea[])
          .filter((a) => a.isActive && a.district)
          .map((a) => areaSelectionKey(a.city, a.district!));

        setSelectedKeys(keys);
        setInitialKeys(keys);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => {
    if (defaultRadiusKm !== initialRadiusKm) return true;
    if (selectedKeys.length !== initialKeys.length) return true;
    const a = [...selectedKeys].sort().join(",");
    const b = [...initialKeys].sort().join(",");
    return a !== b;
  }, [selectedKeys, initialKeys, defaultRadiusKm, initialRadiusKm]);

  const counts = useMemo(
    () => ({
      all: available.length,
      selected: selectedKeys.length,
      unselected: available.length - selectedKeys.length,
    }),
    [available.length, selectedKeys.length],
  );

  const filtered = useMemo(() => {
    let list = available;
    if (filter === "selected") {
      list = list.filter((a) =>
        selectedKeys.includes(areaSelectionKey(a.city, a.district)),
      );
    } else if (filter === "unselected") {
      list = list.filter(
        (a) => !selectedKeys.includes(areaSelectionKey(a.city, a.district)),
      );
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q),
    );
  }, [available, filter, query, selectedKeys]);

  function toggle(city: string, district: string) {
    const key = areaSelectionKey(city, district);
    setMessage("");
    setError("");
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  async function onSave() {
    setMessage("");
    setError("");

    if (selectedKeys.length === 0) {
      setError("En az bir hizmet bölgesi seçmelisiniz");
      return;
    }

    const areas = selectedKeys.map((key) => {
      const sep = key.indexOf("|");
      const city = key.slice(0, sep);
      const district = key.slice(sep + 1);
      return { city, district, radiusKm: defaultRadiusKm };
    });

    setSaving(true);
    try {
      const res = await fetch("/api/provider/areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          areas,
          defaultRadiusKm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi");
        return;
      }

      const keys = ((data.areas ?? []) as SavedArea[])
        .filter((a) => a.isActive && a.district)
        .map((a) => areaSelectionKey(a.city, a.district!));

      setSelectedKeys(keys);
      setInitialKeys(keys);
      if (data.defaultRadiusKm != null) {
        setDefaultRadiusKm(data.defaultRadiusKm);
        setInitialRadiusKm(data.defaultRadiusKm);
      }
      setMessage("Hizmet bölgeleri güncellendi");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    setSelectedKeys(initialKeys);
    setDefaultRadiusKm(initialRadiusKm);
    setMessage("");
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Hizmet Bölgelerim
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Hizmet verdiğiniz il ve ilçeleri seçin; talepler bu bölgelere göre
            eşleşir
          </p>
        </div>
        <Link
          href={ROUTES.provider.profile}
          className="inline-flex h-11 items-center rounded-xl border border-black/10 px-5 text-sm font-bold text-[#5a7a72] hover:bg-[#f8fcfa]"
        >
          Profilime dön
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Seçili bölge", value: counts.selected, tone: "text-[#087a61]" },
          { label: "Platformda açık", value: counts.all, tone: "text-[#083228]" },
          {
            label: "Ekleyebileceğiniz",
            value: counts.unselected,
            tone: "text-[#5a7a72]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs font-semibold text-[#5a7a72]">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-black", stat.tone)}>
              {loading ? "—" : stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="sm:max-w-xs">
            <label
              htmlFor="defaultRadiusKm"
              className="mb-1.5 flex items-center gap-1 text-xs font-bold text-[#5a7a72]"
            >
              <MapPin className="h-3.5 w-3.5" />
              Varsayılan hizmet yarıçapı (km)
            </label>
            <input
              id="defaultRadiusKm"
              type="number"
              min={5}
              max={100}
              value={defaultRadiusKm}
              onChange={(e) => setDefaultRadiusKm(Number(e.target.value))}
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] px-4 text-sm font-medium text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20"
            />
            <p className="mt-1 text-[10px] text-[#9ca3af]">
              Seçili tüm bölgeler için geçerli (5–100 km)
            </p>
          </div>
        </div>

        {message ? (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-[#dcf7e7] px-4 py-3 text-sm font-semibold text-[#10b981]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İl veya ilçe ara..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-10 pr-4 text-sm text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={onReset}
              className="h-11 rounded-xl border border-black/10 px-5 text-sm font-bold text-[#5a7a72] hover:bg-[#f8fcfa] disabled:opacity-50"
            >
              Vazgeç
            </button>
            <button
              type="button"
              disabled={!dirty || saving || selectedKeys.length === 0}
              onClick={() => void onSave()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087a61] px-6 text-sm font-bold text-white hover:bg-[#066b54] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </button>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Bölge filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "selected" as const, label: "Seçili" },
              { key: "unselected" as const, label: "Seçilmemiş" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-bold transition",
                filter === key
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "bg-[#f8fcfa] text-[#5a7a72] hover:bg-[#eef8f5] hover:text-[#087a61]",
              )}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#f8fcfa]" />
            ))}
          </div>
        ) : !hasPlatformAreas ? (
          <div className="rounded-2xl border border-dashed border-amber-300/50 bg-amber-50 p-10 text-center">
            <MapPin className="mx-auto h-10 w-10 text-amber-500/60" />
            <p className="mt-3 text-sm font-semibold text-amber-900">
              Henüz platformda hizmet bölgesi tanımlanmamış.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <MapPin className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#5a7a72]">
              Arama veya filtreye uygun bölge yok.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((area) => {
              const key = areaSelectionKey(area.city, area.district);
              const selected = selectedKeys.includes(key);
              return (
                <li key={key}>
                  <button
                    type="button"
                    onClick={() => toggle(area.city, area.district)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-[#087a61] bg-[#eef8f5] shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                        : "border-black/5 bg-[#f8fafc] hover:border-[#087a61]/30 hover:bg-white",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        selected
                          ? "bg-[#087a61] text-white"
                          : "bg-white text-[#087a61] shadow-sm",
                      )}
                    >
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold text-[#083228]">
                        {area.district}
                      </span>
                      <span className="text-xs text-[#5a7a72]">{area.city}</span>
                    </span>
                    {selected ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#087a61]" />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {dirty ? (
          <p className="mt-4 text-xs font-semibold text-amber-700">
            Kaydedilmemiş değişiklikler var.
          </p>
        ) : null}
      </section>
    </div>
  );
}
