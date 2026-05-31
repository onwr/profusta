"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Tags,
} from "lucide-react";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CategoryOption = {
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl?: string | null;
  description: string | null;
  serviceCount: number;
};

type FilterKey = "all" | "selected" | "unselected";

export function ProviderCategoriesView() {
  const [available, setAvailable] = useState<CategoryOption[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [initialSlugs, setInitialSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    return fetch("/api/provider/categories")
      .then((r) => r.json())
      .then((data) => {
        setAvailable(data.available ?? []);
        const slugs = (data.selectedSlugs ?? []) as string[];
        setSelectedSlugs(slugs);
        setInitialSlugs(slugs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const dirty = useMemo(() => {
    if (selectedSlugs.length !== initialSlugs.length) return true;
    const a = [...selectedSlugs].sort().join(",");
    const b = [...initialSlugs].sort().join(",");
    return a !== b;
  }, [selectedSlugs, initialSlugs]);

  const counts = useMemo(
    () => ({
      all: available.length,
      selected: selectedSlugs.length,
      unselected: available.length - selectedSlugs.length,
    }),
    [available.length, selectedSlugs.length],
  );

  const filtered = useMemo(() => {
    let list = available;
    if (filter === "selected") {
      list = list.filter((c) => selectedSlugs.includes(c.slug));
    } else if (filter === "unselected") {
      list = list.filter((c) => !selectedSlugs.includes(c.slug));
    }
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q) ?? false),
    );
  }, [available, filter, query, selectedSlugs]);

  function toggle(slug: string) {
    setMessage("");
    setError("");
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  async function onSave() {
    setMessage("");
    setError("");

    if (selectedSlugs.length === 0) {
      setError("En az bir kategori seçmelisiniz");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/provider/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categorySlugs: selectedSlugs }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kaydedilemedi");
        return;
      }
      const slugs = (data.selectedSlugs ?? selectedSlugs) as string[];
      setSelectedSlugs(slugs);
      setInitialSlugs(slugs);
      setMessage("Kategoriler güncellendi");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  }

  function onReset() {
    setSelectedSlugs(initialSlugs);
    setMessage("");
    setError("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Hizmet Kategorilerim
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Hangi hizmetlerde teklif verebileceğinizi seçin; talepler buna göre
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
          { label: "Seçili kategori", value: counts.selected, tone: "text-[#087a61]" },
          { label: "Toplam seçenek", value: counts.all, tone: "text-[#083228]" },
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
              placeholder="Kategori ara..."
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
              disabled={!dirty || saving || selectedSlugs.length === 0}
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

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Kategori filtresi">
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
              <div key={i} className="h-24 animate-pulse rounded-xl bg-[#f8fcfa]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <Tags className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#5a7a72]">
              {available.length === 0
                ? "Henüz aktif kategori tanımlanmamış."
                : "Arama veya filtreye uygun kategori yok."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((cat) => {
              const selected = selectedSlugs.includes(cat.slug);
              const Icon = getCategoryIcon(cat.icon);
              return (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => toggle(cat.slug)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
                      selected
                        ? "border-[#087a61] bg-[#eef8f5] shadow-[0_0_0_1px_rgba(37,99,235,0.2)]"
                        : "border-black/5 bg-[#f8fafc] hover:border-[#087a61]/30 hover:bg-white",
                    )}
                  >
                    <CategoryCoverThumb
                      coverImageUrl={cat.coverImageUrl}
                      Icon={Icon}
                      name={cat.name}
                      size="sm"
                      rounded="2xl"
                      className={cn(
                        selected && cat.coverImageUrl && "ring-2 ring-[#087a61]",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#083228]">
                          {cat.name}
                        </span>
                        {selected ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#087a61]" />
                        ) : null}
                      </span>
                      {cat.description ? (
                        <span className="mt-1 line-clamp-2 block text-xs text-[#5a7a72]">
                          {cat.description}
                        </span>
                      ) : null}
                      <span className="mt-2 block text-[10px] font-semibold text-[#9ca3af]">
                        {cat.serviceCount} alt hizmet
                      </span>
                    </span>
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
