"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Clock,
  PlayCircle,
  Search,
  User,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderJobRow = {
  id: string;
  title: string;
  description?: string;
  amount: number;
  netAmount: number;
  status: string;
  customerName?: string;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  latestDispute?: { status: string; phase: string } | null;
};

export {
  PROVIDER_ACTIVE_STATUSES,
  PROVIDER_COMPLETED_STATUSES,
} from "@/lib/provider/job-statuses";

const statusLabels: Record<string, string> = {
  PAID_ESCROW: "Ödeme alındı",
  PROVIDER_ACCEPTED: "Kabul edildi",
  IN_PROGRESS: "Devam ediyor",
  COMPLETED_BY_PROVIDER: "Onay bekleniyor",
  DISPUTED: "İtiraz açık",
  COMPLETED: "Tamamlandı",
  PAYOUT_PENDING: "Ödeme bekliyor",
  PAYOUT_COMPLETED: "Ödendi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

const statusStyles: Record<string, string> = {
  PAID_ESCROW: "bg-[#eef8f5] text-[#087a61]",
  PROVIDER_ACCEPTED: "bg-indigo-50 text-indigo-700",
  IN_PROGRESS: "bg-[#dcf7e7] text-[#10b981]",
  COMPLETED_BY_PROVIDER: "bg-amber-50 text-amber-700",
  DISPUTED: "bg-orange-50 text-orange-700",
  COMPLETED: "bg-[#dcf7e7] text-[#10b981]",
  PAYOUT_PENDING: "bg-amber-50 text-amber-700",
  PAYOUT_COMPLETED: "bg-[#dcf7e7] text-[#10b981]",
  CANCELLED: "bg-slate-100 text-slate-600",
  REFUNDED: "bg-red-50 text-red-600",
};

type ActiveFilter = "all" | "action" | "progress" | "approval" | "disputed";
type CompletedFilter = "all" | "done" | "cancelled";

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

function matchesActiveFilter(job: ProviderJobRow, filter: ActiveFilter) {
  switch (filter) {
    case "action":
      return job.status === "PAID_ESCROW" || job.status === "PROVIDER_ACCEPTED";
    case "progress":
      return job.status === "IN_PROGRESS";
    case "approval":
      return job.status === "COMPLETED_BY_PROVIDER";
    case "disputed":
      return job.status === "DISPUTED";
    default:
      return true;
  }
}

function matchesCompletedFilter(job: ProviderJobRow, filter: CompletedFilter) {
  switch (filter) {
    case "done":
      return ["COMPLETED", "PAYOUT_PENDING", "PAYOUT_COMPLETED"].includes(
        job.status,
      );
    case "cancelled":
      return job.status === "CANCELLED" || job.status === "REFUNDED";
    default:
      return true;
  }
}

export function ProviderJobsList({
  jobs,
  loading,
  variant,
}: {
  jobs: ProviderJobRow[];
  loading: boolean;
  variant: "active" | "completed";
}) {
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [completedFilter, setCompletedFilter] = useState<CompletedFilter>("all");
  const [query, setQuery] = useState("");

  const isActive = variant === "active";

  const activeCounts = useMemo(
    () => ({
      all: jobs.length,
      action: jobs.filter((j) => matchesActiveFilter(j, "action")).length,
      progress: jobs.filter((j) => matchesActiveFilter(j, "progress")).length,
      approval: jobs.filter((j) => matchesActiveFilter(j, "approval")).length,
      disputed: jobs.filter((j) => matchesActiveFilter(j, "disputed")).length,
    }),
    [jobs],
  );

  const completedCounts = useMemo(
    () => ({
      all: jobs.length,
      done: jobs.filter((j) => matchesCompletedFilter(j, "done")).length,
      cancelled: jobs.filter((j) => matchesCompletedFilter(j, "cancelled"))
        .length,
    }),
    [jobs],
  );

  const totalNet = useMemo(
    () => jobs.reduce((s, j) => s + j.netAmount, 0),
    [jobs],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (isActive) {
        if (!matchesActiveFilter(j, activeFilter)) return false;
      } else if (!matchesCompletedFilter(j, completedFilter)) {
        return false;
      }
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.customerName?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      );
    });
  }, [jobs, query, isActive, activeFilter, completedFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {isActive ? (
            <Link
              href={ROUTES.provider.jobsCompleted}
              className="mb-2 inline-flex text-xs font-bold text-[#087a61] hover:underline"
            >
              Tamamlanan işler →
            </Link>
          ) : (
            <Link
              href={ROUTES.provider.jobs}
              className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#087a61] hover:underline"
            >
              ← Aktif işler
            </Link>
          )}
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            {isActive ? "Aktif İşlerim" : "Tamamlanan İşler"}
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            {isActive
              ? "Ödemesi alınmış ve devam eden işleriniz"
              : "Tamamlanan, ödenen veya iptal edilen işler"}
          </p>
        </div>
        {isActive ? (
          <Link
            href={ROUTES.provider.requests}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-black/10 bg-white px-5 text-sm font-bold text-[#083228] hover:bg-[#f8fafc]"
          >
            Yeni talep bul
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isActive
          ? [
              { label: "Aktif iş", value: jobs.length, tone: "text-[#083228]" },
              {
                label: "Devam eden",
                value: activeCounts.progress,
                tone: "text-[#10b981]",
              },
              {
                label: "Onay bekleyen",
                value: activeCounts.approval,
                tone: "text-amber-600",
              },
              {
                label: "Net tutar",
                value: `₺${totalNet.toLocaleString("tr-TR")}`,
                tone: "text-[#087a61]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <p className="text-xs font-semibold text-[#5a7a72]">
                  {stat.label}
                </p>
                <p className={cn("mt-1 text-2xl font-black", stat.tone)}>
                  {loading ? "—" : stat.value}
                </p>
              </div>
            ))
          : [
              { label: "Toplam kayıt", value: jobs.length, tone: "text-[#083228]" },
              {
                label: "Tamamlanan",
                value: completedCounts.done,
                tone: "text-[#10b981]",
              },
              {
                label: "İptal / iade",
                value: completedCounts.cancelled,
                tone: "text-red-600",
              },
              {
                label: "Toplam net",
                value: `₺${totalNet.toLocaleString("tr-TR")}`,
                tone: "text-[#087a61]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <p className="text-xs font-semibold text-[#5a7a72]">
                  {stat.label}
                </p>
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
              placeholder="İş adı veya müşteri ara..."
              className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-11 pr-4 text-sm text-[#083228] outline-none transition focus:border-[#087a61]/40 focus:bg-white focus:ring-2 focus:ring-[#087a61]/15"
            />
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="İş filtresi"
          >
            {isActive
              ? (
                  [
                    { key: "all" as const, label: "Tümü" },
                    { key: "action" as const, label: "Başlatılacak" },
                    { key: "progress" as const, label: "Devam eden" },
                    { key: "approval" as const, label: "Onay bekleyen" },
                    { key: "disputed" as const, label: "İtiraz" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={activeFilter === key}
                    onClick={() => setActiveFilter(key)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-bold transition",
                      activeFilter === key
                        ? "bg-[#087a61] text-white shadow-sm"
                        : "bg-[#f8fcfa] text-[#5a7a72] hover:bg-[#eef8f5] hover:text-[#087a61]",
                    )}
                  >
                    {label} ({activeCounts[key]})
                  </button>
                ))
              : (
                  [
                    { key: "all" as const, label: "Tümü" },
                    { key: "done" as const, label: "Tamamlanan" },
                    { key: "cancelled" as const, label: "İptal / İade" },
                  ] as const
                ).map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={completedFilter === key}
                    onClick={() => setCompletedFilter(key)}
                    className={cn(
                      "rounded-full px-3.5 py-2 text-xs font-bold transition",
                      completedFilter === key
                        ? "bg-[#087a61] text-white shadow-sm"
                        : "bg-[#f8fcfa] text-[#5a7a72] hover:bg-[#eef8f5] hover:text-[#087a61]",
                    )}
                  >
                    {label} ({completedCounts[key]})
                  </button>
                ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-[#f8fcfa]"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
              <Briefcase className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-lg font-black text-[#083228]">
              {isActive ? "Aktif iş yok" : "Tamamlanan iş kaydı yok"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5a7a72]">
              {isActive
                ? "Teklifiniz kabul edilip ödeme alındığında işler burada görünür."
                : "Tamamladığınız işler bu listede arşivlenir."}
            </p>
            {isActive ? (
              <Link
                href={ROUTES.provider.offers}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
              >
                Tekliflerime git
              </Link>
            ) : (
              <Link
                href={ROUTES.provider.jobs}
                className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
              >
                Aktif işlere dön
              </Link>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-[#f8fafc] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              Bu filtrede iş bulunamadı.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setCompletedFilter("all");
                setQuery("");
              }}
              className="mt-3 text-sm font-bold text-[#087a61] hover:underline"
            >
              Tümünü göster
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((job) => {
              const initial = (job.customerName ?? "?").charAt(0).toUpperCase();
              const needsAction =
                job.status === "PAID_ESCROW" ||
                job.status === "PROVIDER_ACCEPTED";

              return (
                <li key={job.id}>
                  <Link
                    href={`${ROUTES.provider.jobs}/${job.id}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/25 hover:bg-white hover:shadow-[0_8px_24px_rgba(12,38,84,0.08)] sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#064a3f] to-[#087a61] text-lg font-black text-white">
                        {initial}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-[#083228] group-hover:text-[#087a61]">
                            {job.title}
                          </h3>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-[10px] font-black",
                              statusStyles[job.status] ??
                                "bg-slate-100 text-slate-600",
                            )}
                          >
                            {statusLabels[job.status] ?? job.status}
                          </span>
                          {job.latestDispute ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-black text-orange-700">
                              <AlertTriangle className="h-3 w-3" />
                              İtiraz
                            </span>
                          ) : null}
                        </div>

                        {job.customerName ? (
                          <p className="mt-0.5 flex items-center gap-1 text-sm text-[#5a7a72]">
                            <User className="h-3.5 w-3.5" />
                            {job.customerName}
                          </p>
                        ) : null}

                        {job.description ? (
                          <p className="mt-2 line-clamp-2 text-sm text-[#5a7a72]">
                            {job.description}
                          </p>
                        ) : null}

                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#5a7a72]">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-[#087a61]" />
                            {timeAgo(job.createdAt)}
                          </span>
                          {job.paidAt ? (
                            <span className="inline-flex items-center gap-1">
                              <PlayCircle className="h-3.5 w-3.5 text-[#087a61]" />
                              Ödeme:{" "}
                              {new Date(job.paidAt).toLocaleDateString("tr-TR")}
                            </span>
                          ) : null}
                          {job.completedAt ? (
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#10b981]" />
                              Bitiş:{" "}
                              {new Date(job.completedAt).toLocaleDateString(
                                "tr-TR",
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="text-right">
                        <p className="text-xl font-black text-[#083228]">
                          ₺{job.amount.toLocaleString("tr-TR")}
                        </p>
                        <p className="text-[11px] font-semibold text-[#5a7a72]">
                          Net ₺{job.netAmount.toLocaleString("tr-TR")}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "inline-flex h-10 items-center justify-center gap-1 rounded-xl px-4 text-xs font-black transition",
                          needsAction
                            ? "bg-[#087a61] text-white group-hover:bg-[#066b54]"
                            : "bg-white text-[#083228] ring-1 ring-black/5 group-hover:text-[#087a61]",
                        )}
                      >
                        {needsAction ? "İşleme al" : "Detay"}
                        <ArrowRight className="h-3.5 w-3.5" />
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
