"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderReviewRow = {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  orderId: string;
  orderTitle: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

type ReviewSummary = {
  ratingAvg: number | null;
  reviewCount: number;
  visibleCount: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  lowStar: number;
  last30Days: number;
};

type FilterKey = "all" | "5" | "4" | "3" | "low";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StarRating({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const iconClass = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} yıldız`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            iconClass,
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "fill-[#e5e7eb] text-[#e5e7eb]",
          )}
        />
      ))}
    </span>
  );
}

export function ProviderReviewsView({
  reviews,
  summary,
  loading,
}: {
  reviews: ProviderReviewRow[];
  summary: ReviewSummary | null;
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const counts = useMemo(
    () => ({
      all: reviews.length,
      "5": reviews.filter((r) => r.rating === 5).length,
      "4": reviews.filter((r) => r.rating === 4).length,
      "3": reviews.filter((r) => r.rating === 3).length,
      low: reviews.filter((r) => r.rating <= 2).length,
    }),
    [reviews],
  );

  const filtered = useMemo(() => {
    let list = reviews;
    if (filter === "5") list = list.filter((r) => r.rating === 5);
    else if (filter === "4") list = list.filter((r) => r.rating === 4);
    else if (filter === "3") list = list.filter((r) => r.rating === 3);
    else if (filter === "low") list = list.filter((r) => r.rating <= 2);

    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (r) =>
        r.orderTitle.toLowerCase().includes(q) ||
        r.authorName.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q),
    );
  }, [reviews, filter, query]);

  const maxDist = Math.max(
    summary?.fiveStar ?? 0,
    summary?.fourStar ?? 0,
    summary?.threeStar ?? 0,
    summary?.lowStar ?? 0,
    1,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-black leading-tight text-[#083228]">
          Değerlendirmeler
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          Müşterilerinizin iş sonrası bıraktığı yorum ve puanlar
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="flex flex-col justify-center rounded-2xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#5a7a72]">
            Ortalama puan
          </p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-[48px] font-black leading-none text-[#083228]">
              {loading ? "—" : summary?.ratingAvg?.toFixed(1) ?? "—"}
            </span>
            <span className="mb-2 text-lg font-bold text-[#9ca3af]">/ 5</span>
          </div>
          <div className="mt-2">
            <StarRating
              rating={Math.round(summary?.ratingAvg ?? 0)}
              size="md"
            />
          </div>
          <p className="mt-3 text-sm text-[#5a7a72]">
            {loading
              ? "Yükleniyor..."
              : `${summary?.reviewCount ?? 0} görünür değerlendirme`}
          </p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-8">
          <p className="mb-4 text-[15px] font-black text-[#083228]">Puan dağılımı</p>
          <div className="space-y-3">
            {[
              { label: "5 yıldız", value: summary?.fiveStar ?? 0, tone: "bg-[#10b981]" },
              { label: "4 yıldız", value: summary?.fourStar ?? 0, tone: "bg-[#087a61]" },
              { label: "3 yıldız", value: summary?.threeStar ?? 0, tone: "bg-amber-400" },
              { label: "1–2 yıldız", value: summary?.lowStar ?? 0, tone: "bg-red-400" },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs font-bold text-[#5a7a72]">
                  {row.label}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#f8fcfa]">
                  <div
                    className={cn("h-full rounded-full transition-all", row.tone)}
                    style={{
                      width: loading
                        ? "0%"
                        : `${Math.max(4, (row.value / maxDist) * 100)}%`,
                    }}
                  />
                </div>
                <span className="w-6 text-right text-xs font-black text-[#083228]">
                  {loading ? "—" : row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Toplam", value: counts.all, tone: "text-[#083228]" },
          {
            label: "Ortalama",
            value: summary?.ratingAvg?.toFixed(1) ?? "—",
            tone: "text-amber-500",
          },
          { label: "5 yıldız", value: summary?.fiveStar ?? 0, tone: "text-[#10b981]" },
          {
            label: "Son 30 gün",
            value: summary?.last30Days ?? 0,
            tone: "text-[#087a61]",
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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1 sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İş, müşteri veya yorum ara..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-10 pr-4 text-sm text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20"
            />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Puan filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "5" as const, label: "5 yıldız" },
              { key: "4" as const, label: "4 yıldız" },
              { key: "3" as const, label: "3 yıldız" },
              { key: "low" as const, label: "1–2 yıldız" },
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
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-[#f8fcfa]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <Star className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#5a7a72]">
              {reviews.length === 0
                ? "Henüz değerlendirme almadınız."
                : "Bu filtreye uygun yorum bulunamadı."}
            </p>
            {reviews.length === 0 ? (
              <p className="mt-2 text-xs text-[#9ca3af]">
                Tamamlanan işlerden sonra müşteri yorumları burada listelenir.
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((review) => (
              <li
                key={review.id}
                className="rounded-xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/30 hover:bg-white"
              >
                <div className="flex flex-wrap items-start gap-4">
                  {review.authorAvatarUrl ? (
                    <Image
                      src={review.authorAvatarUrl}
                      alt=""
                      width={44}
                      height={44}
                      className="h-11 w-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef8f5] text-sm font-black text-[#087a61]">
                      {initials(review.authorName)}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#083228]">
                        {review.authorName}
                      </p>
                      {!review.isVisible ? (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
                          Gizli
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs font-semibold text-[#5a7a72]">
                      {review.orderTitle}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-[#9ca3af]">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-3 text-sm leading-relaxed text-[#374151]">
                        {review.comment}
                      </p>
                    ) : null}
                    <Link
                      href={`${ROUTES.provider.jobs}/${review.orderId}`}
                      className="mt-2 inline-block text-xs font-bold text-[#087a61] hover:underline"
                    >
                      İş detayı
                    </Link>
                  </div>

                  <p className="text-2xl font-black text-amber-500">{review.rating}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
