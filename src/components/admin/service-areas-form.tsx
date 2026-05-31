"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ServiceAreasConfig } from "@/lib/settings/service-areas-types";

type ProvinceMeta = {
  name: string;
  slug: string;
  towns: { name: string; slug: string }[];
};

type Stats = { provinceCount: number; townCount: number };

export function ServiceAreasForm() {
  const [provinces, setProvinces] = useState<ProvinceMeta[]>([]);
  const [enabled, setEnabled] = useState<Record<string, string[]>>({});
  const [stats, setStats] = useState<Stats>({ provinceCount: 0, townCount: 0 });
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/settings/service-areas");
    const data = await res.json();
    if (res.ok) {
      setProvinces(data.provinces ?? []);
      setEnabled(data.config?.enabled ?? {});
      setStats(data.stats ?? { provinceCount: 0, townCount: 0 });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("tr-TR");
    if (!q) return provinces;
    return provinces.filter(
      (p) =>
        p.name.toLocaleLowerCase("tr-TR").includes(q) ||
        p.towns.some((t) => t.name.toLocaleLowerCase("tr-TR").includes(q)),
    );
  }, [provinces, search]);

  function isProvinceFullyEnabled(slug: string, townCount: number) {
    const towns = enabled[slug];
    return towns != null && towns.length === 0 && townCount > 0;
  }

  function isProvincePartiallyEnabled(slug: string) {
    const towns = enabled[slug];
    return towns != null && towns.length > 0;
  }

  function isTownEnabled(provinceSlug: string, townSlug: string) {
    const towns = enabled[provinceSlug];
    if (!towns) return false;
    if (towns.length === 0) return true;
    return towns.includes(townSlug);
  }

  function toggleProvince(province: ProvinceMeta) {
    setEnabled((prev) => {
      const next = { ...prev };
      if (next[province.slug] != null) {
        delete next[province.slug];
      } else {
        next[province.slug] = [];
      }
      return next;
    });
  }

  function toggleTown(province: ProvinceMeta, townSlug: string) {
    setEnabled((prev) => {
      const next = { ...prev };
      let towns = next[province.slug];

      if (towns == null) {
        next[province.slug] = [townSlug];
        return next;
      }

      if (towns.length === 0) {
        towns = province.towns
          .map((t) => t.slug)
          .filter((s) => s !== townSlug);
        next[province.slug] = towns;
        return next;
      }

      if (towns.includes(townSlug)) {
        towns = towns.filter((s) => s !== townSlug);
      } else {
        towns = [...towns, townSlug];
      }

      if (towns.length === 0) {
        delete next[province.slug];
      } else if (towns.length === province.towns.length) {
        next[province.slug] = [];
      } else {
        next[province.slug] = towns;
      }

      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage("");
    const config: ServiceAreasConfig = { enabled };
    const res = await fetch("/api/admin/settings/service-areas", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    const data = await res.json();
    if (res.ok) {
      setStats(data.stats);
      setMessage("Hizmet bölgeleri kaydedildi.");
    } else {
      setMessage(data.error ?? "Kayıt başarısız");
    }
    setSaving(false);
  }

  if (loading) {
    return <p className="text-sm text-[#53635f]">Yükleniyor...</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-[#53635f]">
          <span className="font-bold text-[#083228]">{stats.provinceCount}</span> il,{" "}
          <span className="font-bold text-[#083228]">{stats.townCount}</span> ilçe aktif
        </p>
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>

      {message ? (
        <p className="mt-3 text-sm font-semibold text-[#087a61]">{message}</p>
      ) : null}

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="İl veya ilçe ara..."
        className="mt-6 w-full max-w-md rounded-xl border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-[#087a61]/40"
      />

      <ul className="mt-6 max-h-[70vh] space-y-2 overflow-y-auto rounded-2xl border border-black/5 bg-white p-4">
        {filteredProvinces.map((province) => {
          const active =
            isProvinceFullyEnabled(province.slug, province.towns.length) ||
            isProvincePartiallyEnabled(province.slug);
          const isOpen = expanded === province.slug;

          return (
            <li
              key={province.slug}
              className="rounded-xl border border-black/5"
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleProvince(province)}
                  className="h-4 w-4 accent-[#087a61]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isOpen ? null : province.slug)
                  }
                  className="flex flex-1 items-center justify-between text-left text-sm font-bold text-[#083228]"
                >
                  {province.name}
                  <span className="text-xs font-semibold text-[#7b8b87]">
                    {enabled[province.slug]?.length === 0 && active
                      ? "Tüm ilçeler"
                      : `${enabled[province.slug]?.length ?? 0} ilçe`}
                  </span>
                </button>
              </div>

              {isOpen ? (
                <div className="grid gap-1 border-t border-black/5 px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
                  {province.towns.map((town) => (
                    <label
                      key={town.slug}
                      className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#eef8f5]"
                    >
                      <input
                        type="checkbox"
                        checked={isTownEnabled(province.slug, town.slug)}
                        onChange={() => toggleTown(province, town.slug)}
                        className="h-3.5 w-3.5 accent-[#087a61]"
                      />
                      {town.name}
                    </label>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-xs text-[#7b8b87]">
        İl kutusunu işaretlemek tüm ilçeleri açar. Tek tek ilçe seçmek için ili
        genişletin. Slug verileri turkey-locations.json dosyasından gelir.
      </p>
    </div>
  );
}
