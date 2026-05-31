"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  ClipboardList,
  Clock,
  Lightbulb,
  MapPin,
  Plug,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderRequestRow = {
  id: string;
  status: string;
  city: string;
  district: string | null;
  neighborhood: string | null;
  description: string;
  preferredDate: string | null;
  preferredTime: string | null;
  distanceKm: number;
  createdAt: string;
  category: { name: string; slug: string };
  service: { name: string } | null;
  customerName: string;
  imageUrl: string | null;
  myOffer: { id: string; status: string; price: number } | null;
};

type FilterKey = "all" | "open" | "offered" | "accepted" | "closed";

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  OFFER_ACCEPTED: "Teklif kabul edildi",
  CANCELLED: "İptal",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#eef8f5] text-[#087a61]",
  OFFER_ACCEPTED: "bg-[#dcf7e7] text-[#10b981]",
  CANCELLED: "bg-red-50 text-red-600",
};

const offerStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-[#dcf7e7] text-[#10b981]",
  REJECTED: "bg-red-50 text-red-600",
};

const offerLabels: Record<string, string> = {
  PENDING: "Teklifiniz bekliyor",
  ACCEPTED: "Teklifiniz kabul edildi",
  REJECTED: "Teklifiniz reddedildi",
};

const CATEGORY_ICONS = [
  { bg: "bg-[#dcf7e7]", text: "text-[#10b981]", icon: Lightbulb },
  { bg: "bg-[#fff4cc]", text: "text-[#eab308]", icon: Plug },
  { bg: "bg-[#fde3e3]", text: "text-[#ef4444]", icon: Zap },
  { bg: "bg-[#eef8f5]", text: "text-[#087a61]", icon: Wrench },
  { bg: "bg-[#ede4ff]", text: "text-[#7c3aed]", icon: Briefcase },
] as const;

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

function matchesFilter(request: ProviderRequestRow, filter: FilterKey) {
  switch (filter) {
    case "open":
      return request.status === "OPEN" && !request.myOffer;
    case "offered":
      return request.myOffer?.status === "PENDING";
    case "accepted":
      return (
        request.status === "OFFER_ACCEPTED" ||
        request.myOffer?.status === "ACCEPTED"
      );
    case "closed":
      return request.status === "CANCELLED";
    default:
      return true;
  }
}

export function ProviderRequestsList({
  requests,
  loading,
}: {
  requests: ProviderRequestRow[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: requests.length,
      open: requests.filter((r) => matchesFilter(r, "open")).length,
      offered: requests.filter((r) => matchesFilter(r, "offered")).length,
      accepted: requests.filter((r) => matchesFilter(r, "accepted")).length,
      closed: requests.filter((r) => matchesFilter(r, "closed")).length,
    }),
    [requests],
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "open", label: "Teklif Bekleyen" },
    { key: "offered", label: "Teklif Verdim" },
    { key: "accepted", label: "Kabul Edilen" },
    { key: "closed", label: "İptal" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (!matchesFilter(r, filter)) return false;
      if (!q) return true;
      return (
        r.category.name.toLowerCase().includes(q) ||
        r.service?.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.district?.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      );
    });
  }, [requests, filter, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-black leading-tight text-[#083228]">
          Gelen Talepler
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          Kategori ve konumunuza uygun müşteri talepleri
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Toplam talep", value: counts.all, tone: "text-[#083228]" },
          {
            label: "Teklif bekleyen",
            value: counts.open,
            tone: "text-[#087a61]",
          },
          {
            label: "Teklif verdim",
            value: counts.offered,
            tone: "text-amber-600",
          },
          {
            label: "Kabul edilen",
            value: counts.accepted,
            tone: "text-[#10b981]",
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
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative min-w-0 flex-1 lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kategori, konum veya açıklama ara..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-11 pr-4 text-sm text-[#083228] outline-none transition focus:border-[#087a61]/40 focus:bg-white focus:ring-2 focus:ring-[#087a61]/15"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Talep filtresi"
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
                className="h-32 animate-pulse rounded-2xl bg-[#f8fcfa]"
              />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
              <ClipboardList className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-black text-[#083228]">
              Henüz size uygun talep yok
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5a7a72]">
              Kategori ve hizmet bölgelerinizi güncellediğinizde yeni talepler
              burada listelenir.
            </p>
            <Link
              href={ROUTES.provider.areas}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
            >
              Hizmet bölgelerini düzenle
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#f8fafc] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              Bu filtrede talep bulunamadı.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
              className="mt-3 text-sm font-bold text-[#087a61] hover:underline"
            >
              Tüm talepleri göster
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((request, index) => {
              const tone = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
              const Icon = tone.icon;
              const canOffer =
                request.status === "OPEN" && !request.myOffer;

              return (
                <li key={request.id}>
                  <Link
                    href={`${ROUTES.provider.requests}/${request.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/25 hover:bg-white hover:shadow-[0_8px_24px_rgba(12,38,84,0.08)] sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 gap-4">
                      {request.imageUrl ? (
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                          <Image
                            src={request.imageUrl}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      ) : (
                        <span
                          className={cn(
                            "grid h-16 w-16 shrink-0 place-items-center rounded-xl",
                            tone.bg,
                            tone.text,
                          )}
                        >
                          <Icon className="h-7 w-7" />
                        </span>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-[#083228]">
                            {request.category.name}
                          </h3>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                              statusStyles[request.status] ??
                                "bg-slate-100 text-slate-600",
                            )}
                          >
                            {statusLabels[request.status] ?? request.status}
                          </span>
                          {request.myOffer ? (
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                                offerStyles[request.myOffer.status] ??
                                  "bg-slate-100 text-slate-600",
                              )}
                            >
                              {offerLabels[request.myOffer.status] ??
                                request.myOffer.status}
                            </span>
                          ) : null}
                        </div>

                        {request.service ? (
                          <p className="mt-0.5 text-sm text-[#5a7a72]">
                            {request.service.name}
                          </p>
                        ) : null}

                        <p className="mt-2 line-clamp-2 text-sm text-[#5a7a72]">
                          {request.description}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5a7a72]">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                            {request.city}
                            {request.district ? `, ${request.district}` : ""}
                            <span className="text-[#9ca3af]">
                              · {request.distanceKm.toFixed(1)} km
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#087a61]" />
                            {timeAgo(request.createdAt)}
                          </span>
                          {request.preferredDate ? (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
                              {new Date(request.preferredDate).toLocaleDateString(
                                "tr-TR",
                                { day: "numeric", month: "short" },
                              )}
                              {request.preferredTime
                                ? ` ${request.preferredTime}`
                                : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                      {request.myOffer ? (
                        <p className="text-lg font-black text-[#083228]">
                          ₺{request.myOffer.price.toLocaleString("tr-TR")}
                        </p>
                      ) : null}
                      <span
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-xl px-4 text-xs font-black transition",
                          canOffer
                            ? "bg-[#087a61] text-white group-hover:bg-[#066b54]"
                            : "bg-white text-[#083228] ring-1 ring-black/5 group-hover:text-[#087a61]",
                        )}
                      >
                        {canOffer ? "Teklif Ver" : "Detay"}
                        <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
