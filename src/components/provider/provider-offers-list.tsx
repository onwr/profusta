"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  Lightbulb,
  MapPin,
  Plug,
  Search,
  Wrench,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderOfferRow = {
  id: string;
  price: number;
  description: string;
  estimatedDuration: string | null;
  proposedDate: string | null;
  status: string;
  createdAt: string;
  request: {
    id: string;
    status: string;
    city: string;
    district: string | null;
    category: { name: string; slug: string };
    service: { name: string } | null;
    imageUrl: string | null;
  };
};

type FilterKey = "all" | "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";

const statusLabels: Record<string, string> = {
  PENDING: "Bekliyor",
  ACCEPTED: "Kabul edildi",
  REJECTED: "Reddedildi",
  WITHDRAWN: "Geri çekildi",
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACCEPTED: "bg-[#dcf7e7] text-[#10b981]",
  REJECTED: "bg-red-50 text-red-600",
  WITHDRAWN: "bg-slate-100 text-slate-600",
};

const requestStatusLabels: Record<string, string> = {
  OPEN: "Talep açık",
  OFFER_ACCEPTED: "Talep kapatıldı",
  CANCELLED: "Talep iptal",
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

export function ProviderOffersList({
  offers,
  loading,
  onRefresh,
}: {
  offers: ProviderOfferRow[];
  loading: boolean;
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const counts = useMemo(
    () => ({
      all: offers.length,
      PENDING: offers.filter((o) => o.status === "PENDING").length,
      ACCEPTED: offers.filter((o) => o.status === "ACCEPTED").length,
      REJECTED: offers.filter((o) => o.status === "REJECTED").length,
      WITHDRAWN: offers.filter((o) => o.status === "WITHDRAWN").length,
    }),
    [offers],
  );

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tümü" },
    { key: "PENDING", label: "Bekliyor" },
    { key: "ACCEPTED", label: "Kabul" },
    { key: "REJECTED", label: "Red" },
    { key: "WITHDRAWN", label: "Geri çekildi" },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return offers.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!q) return true;
      return (
        o.request.category.name.toLowerCase().includes(q) ||
        o.request.service?.name.toLowerCase().includes(q) ||
        o.request.city.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    });
  }, [offers, filter, query]);

  const totalPendingValue = useMemo(
    () =>
      offers
        .filter((o) => o.status === "PENDING")
        .reduce((s, o) => s + o.price, 0),
    [offers],
  );

  async function withdraw(offerId: string) {
    if (!confirm("Teklifi geri çekmek istiyor musunuz?")) return;
    setWithdrawingId(offerId);
    await fetch(`/api/provider/offers/${offerId}/withdraw`, { method: "PATCH" });
    setWithdrawingId(null);
    onRefresh?.();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Tekliflerim
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Gönderdiğiniz teklifleri takip edin ve yönetin
          </p>
        </div>
        <Link
          href={ROUTES.provider.requests}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
        >
          Yeni talep bul
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Toplam teklif", value: counts.all, tone: "text-[#083228]" },
          { label: "Bekleyen", value: counts.PENDING, tone: "text-amber-600" },
          { label: "Kabul edilen", value: counts.ACCEPTED, tone: "text-[#10b981]" },
          { label: "Bekleyen tutar", value: `₺${totalPendingValue.toLocaleString("tr-TR")}`, tone: "text-[#087a61]" },
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
            aria-label="Teklif filtresi"
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
        ) : offers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-black text-[#083228]">
              Henüz teklif göndermediniz
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5a7a72]">
              Gelen taleplere teklif vererek müşterilerle eşleşmeye başlayın.
            </p>
            <Link
              href={ROUTES.provider.requests}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
            >
              Gelen taleplere git
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#f8fafc] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              Bu filtrede teklif bulunamadı.
            </p>
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setQuery("");
              }}
              className="mt-3 text-sm font-bold text-[#087a61] hover:underline"
            >
              Tüm teklifleri göster
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((offer, index) => {
              const tone = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
              const Icon = tone.icon;
              const canWithdraw =
                offer.status === "PENDING" && offer.request.status === "OPEN";

              return (
                <li key={offer.id}>
                  <article className="rounded-2xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_8px_24px_rgba(12,38,84,0.06)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                      <div className="flex min-w-0 flex-1 gap-4">
                        {offer.request.imageUrl ? (
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                            <Image
                              src={offer.request.imageUrl}
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
                            <Link
                              href={`${ROUTES.provider.requests}/${offer.request.id}`}
                              className="truncate text-base font-black text-[#083228] hover:text-[#087a61]"
                            >
                              {offer.request.category.name}
                            </Link>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                                statusStyles[offer.status] ??
                                  "bg-slate-100 text-slate-600",
                              )}
                            >
                              {statusLabels[offer.status] ?? offer.status}
                            </span>
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#5a7a72] ring-1 ring-black/5">
                              {requestStatusLabels[offer.request.status] ??
                                offer.request.status}
                            </span>
                          </div>

                          {offer.request.service ? (
                            <p className="mt-0.5 text-sm text-[#5a7a72]">
                              {offer.request.service.name}
                            </p>
                          ) : null}

                          <p className="mt-2 line-clamp-2 text-sm text-[#5a7a72]">
                            {offer.description}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5a7a72]">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                              {offer.request.city}
                              {offer.request.district
                                ? `, ${offer.request.district}`
                                : ""}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#087a61]" />
                              {timeAgo(offer.createdAt)}
                            </span>
                            {offer.estimatedDuration ? (
                              <span>Süre: {offer.estimatedDuration}</span>
                            ) : null}
                            {offer.proposedDate ? (
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
                                {new Date(offer.proposedDate).toLocaleDateString(
                                  "tr-TR",
                                  { day: "numeric", month: "short" },
                                )}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-row items-center gap-2 lg:flex-col lg:items-end">
                        <p className="text-2xl font-black text-[#083228]">
                          ₺{offer.price.toLocaleString("tr-TR")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {canWithdraw ? (
                            <button
                              type="button"
                              disabled={withdrawingId === offer.id}
                              onClick={() => void withdraw(offer.id)}
                              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              {withdrawingId === offer.id
                                ? "Geri çekiliyor…"
                                : "Geri çek"}
                            </button>
                          ) : null}
                          <Link
                            href={`${ROUTES.provider.requests}/${offer.request.id}`}
                            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-[#087a61] px-4 text-xs font-black text-white hover:bg-[#066b54]"
                          >
                            Talep detayı
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
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
