"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  MapPin,
  Megaphone,
  Plus,
  Search,
} from "lucide-react";
import {
  LISTING_STATUS_LABELS,
  LISTING_STATUS_STYLES,
  type ListingFilterKey,
} from "@/lib/provider/listing-statuses";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderListingRow = {
  id: string;
  title: string;
  description: string;
  price: number;
  city: string;
  district: string | null;
  status: string;
  rejectedReason: string | null;
  serviceRadiusKm: number;
  createdAt: string;
  approvedAt: string | null;
  category: { name: string; slug: string };
  imageUrl: string | null;
  imageCount: number;
};

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

export function ProviderListingsList({
  listings,
  loading,
  actionId,
  onDeactivate,
}: {
  listings: ProviderListingRow[];
  loading: boolean;
  actionId: string | null;
  onDeactivate: (id: string) => void;
}) {
  const [filter, setFilter] = useState<ListingFilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: listings.length,
      PENDING: listings.filter((l) => l.status === "PENDING").length,
      ACTIVE: listings.filter((l) => l.status === "ACTIVE").length,
      REJECTED: listings.filter((l) => l.status === "REJECTED").length,
      INACTIVE: listings.filter((l) => l.status === "INACTIVE").length,
    }),
    [listings],
  );

  const filters: { key: ListingFilterKey; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "ACTIVE", label: "Yayında" },
    { key: "PENDING", label: "Onay bekliyor" },
    { key: "REJECTED", label: "Reddedildi" },
    { key: "INACTIVE", label: "Pasif" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter((l) => {
      if (filter !== "all" && l.status !== filter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        l.category.name.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q)
      );
    });
  }, [listings, filter, query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            İlanlarım
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Hizmet ilanlarınızı oluşturun ve yönetin
          </p>
        </div>
        <Link
          href={`${ROUTES.provider.listings}/yeni`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
        >
          <Plus className="h-4 w-4" />
          Yeni ilan
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Toplam ilan", value: counts.all, tone: "text-[#083228]" },
          { label: "Yayında", value: counts.ACTIVE, tone: "text-[#10b981]" },
          { label: "Onay bekliyor", value: counts.PENDING, tone: "text-amber-600" },
          { label: "Reddedildi", value: counts.REJECTED, tone: "text-red-600" },
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
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İlan adı, kategori veya şehir ara..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-11 pr-4 text-sm text-[#083228] outline-none transition focus:border-[#087a61]/40 focus:bg-white focus:ring-2 focus:ring-[#087a61]/15"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="İlan filtresi"
          >
            {filters.map(({ key, label }) => (
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
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl bg-[#f8fcfa]"
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
              <Megaphone className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-black text-[#083228]">
              Henüz ilanınız yok
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5a7a72]">
              İlan oluşturarak müşterilerin sizi doğrudan bulmasını sağlayın.
              İlanlar admin onayından sonra yayınlanır.
            </p>
            <Link
              href={`${ROUTES.provider.listings}/yeni`}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
            >
              <Plus className="h-4 w-4" />
              İlk ilanımı oluştur
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#f8fafc] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              Bu filtrede ilan bulunamadı.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
              className="mt-3 text-sm font-bold text-[#087a61] hover:underline"
            >
              Tüm ilanları göster
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((listing) => {
              const canEdit =
                listing.status === "PENDING" || listing.status === "REJECTED";
              const canDeactivate = listing.status === "ACTIVE";

              return (
                <li key={listing.id}>
                  <article className="rounded-2xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_8px_24px_rgba(12,38,84,0.06)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      {listing.imageUrl ? (
                        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-white">
                          <Image
                            src={listing.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                          {listing.imageCount > 1 ? (
                            <span className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                              +{listing.imageCount - 1}
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <div className="grid h-24 w-32 shrink-0 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
                          <Megaphone className="h-8 w-8" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-[#083228]">
                            {listing.title}
                          </h3>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                              LISTING_STATUS_STYLES[listing.status] ??
                                "bg-slate-100 text-slate-600",
                            )}
                          >
                            {LISTING_STATUS_LABELS[listing.status] ??
                              listing.status}
                          </span>
                        </div>

                        <p className="mt-0.5 text-sm font-semibold text-[#5a7a72]">
                          {listing.category.name}
                        </p>

                        <p className="mt-2 line-clamp-2 text-sm text-[#5a7a72]">
                          {listing.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5a7a72]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                            {listing.city}
                            {listing.district ? `, ${listing.district}` : ""}
                            <span className="text-[#9ca3af]">
                              · {listing.serviceRadiusKm} km
                            </span>
                          </span>
                          <span>{timeAgo(listing.createdAt)}</span>
                        </div>

                        {listing.rejectedReason ? (
                          <p className="mt-2 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {listing.rejectedReason}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-col items-end gap-3 lg:min-w-[140px]">
                        <p className="text-2xl font-black text-[#083228]">
                          ₺{listing.price.toLocaleString("tr-TR")}
                        </p>

                        <div className="flex flex-wrap justify-end gap-2">
                          {canEdit ? (
                            <Link
                              href={`${ROUTES.provider.listings}/${listing.id}/duzenle`}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 bg-white px-4 text-xs font-bold text-[#083228] hover:bg-[#f8fafc]"
                            >
                              Düzenle
                            </Link>
                          ) : null}
                          {canDeactivate ? (
                            <button
                              type="button"
                              disabled={actionId === listing.id}
                              onClick={() => onDeactivate(listing.id)}
                              className="inline-flex h-9 items-center justify-center rounded-xl border border-red-200 bg-white px-4 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {actionId === listing.id
                                ? "İşleniyor…"
                                : "Pasife al"}
                            </button>
                          ) : null}
                          {listing.status === "ACTIVE" ? (
                            <span className="inline-flex h-9 items-center gap-1 rounded-xl bg-[#087a61]/10 px-3 text-xs font-bold text-[#087a61]">
                              Yayında
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
