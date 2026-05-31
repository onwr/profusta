"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Clock,
  Loader2,
  XCircle,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderPayoutRow = {
  id: string;
  amount: number;
  iban: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

type FilterKey = "all" | "PENDING" | "APPROVED" | "REJECTED" | "PAID";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
  PAID: "Ödendi",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  APPROVED: "bg-[#eef8f5] text-[#087a61]",
  REJECTED: "bg-red-50 text-red-600",
  PAID: "bg-[#dcf7e7] text-[#10b981]",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
  PAID: Banknote,
};

function formatMoney(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ProviderPayoutsView({
  payouts,
  availableBalance,
  hasIban,
  ibanMasked,
  loading,
  onRefresh,
}: {
  payouts: ProviderPayoutRow[];
  availableBalance: number;
  hasIban: boolean;
  ibanMasked: string | null;
  loading: boolean;
  onRefresh: () => void | Promise<void>;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  const counts = useMemo(
    () => ({
      all: payouts.length,
      PENDING: payouts.filter((p) => p.status === "PENDING").length,
      APPROVED: payouts.filter((p) => p.status === "APPROVED").length,
      REJECTED: payouts.filter((p) => p.status === "REJECTED").length,
      PAID: payouts.filter((p) => p.status === "PAID").length,
    }),
    [payouts],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return payouts;
    return payouts.filter((p) => p.status === filter);
  }, [payouts, filter]);

  const pendingTotal = useMemo(
    () =>
      payouts
        .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
        .reduce((s, p) => s + p.amount, 0),
    [payouts],
  );

  const paidTotal = useMemo(
    () =>
      payouts.filter((p) => p.status === "PAID").reduce((s, p) => s + p.amount, 0),
    [payouts],
  );

  const mask = "•••••";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Geçerli bir tutar girin");
      return;
    }
    if (value > availableBalance) {
      setError(`Kullanılabilir bakiye: ₺${formatMoney(availableBalance)}`);
      return;
    }
    if (!hasIban) {
      setError("Önce profilinize IBAN ekleyin");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/provider/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: value }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Talep oluşturulamadı");
        return;
      }
      setAmount("");
      onRefresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={ROUTES.provider.earnings}
            className="mb-2 inline-flex items-center gap-1 text-xs font-bold text-[#087a61] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kazançlarım
          </Link>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Ödeme Taleplerim
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Bakiyenizi banka hesabınıza çekin ve talepleri takip edin
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#083228] via-[#0a1f47] to-[#061838] p-6 text-white shadow-[0_8px_24px_rgba(12,38,84,0.2)] lg:col-span-5">
          <div className="flex items-start justify-between">
            <p className="text-sm font-semibold text-white/70">Kullanılabilir bakiye</p>
            <button
              type="button"
              onClick={() => setShowBalance((v) => !v)}
              className="text-xs font-bold text-white/60 hover:text-white"
            >
              {showBalance ? "Gizle" : "Göster"}
            </button>
          </div>
          <p className="mt-2 text-[36px] font-black leading-tight">
            ₺{showBalance ? formatMoney(availableBalance) : mask}
          </p>
          {ibanMasked ? (
            <p className="mt-3 text-sm text-white/70">
              Kayıtlı IBAN:{" "}
              <span className="font-semibold text-white">
                {showBalance ? ibanMasked : mask}
              </span>
            </p>
          ) : (
            <p className="mt-3 text-sm text-amber-200">
              Para çekmek için profilinize IBAN ekleyin.
            </p>
          )}
          {!hasIban ? (
            <Link
              href={ROUTES.provider.profile}
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-white/15 px-4 text-sm font-bold text-white hover:bg-white/25"
            >
              Profilime git
            </Link>
          ) : null}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm lg:col-span-7"
        >
          <h2 className="text-[15px] font-black text-[#083228]">Yeni çekim talebi</h2>
          <p className="mt-1 text-xs text-[#5a7a72]">
            Minimum 1 ₺ · Onay sonrası hesabınıza aktarılır
          </p>

          <label className="mt-5 block text-xs font-bold text-[#5a7a72]">
            Talep tutarı (₺)
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="number"
              min={1}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              disabled={!hasIban || submitting}
              className="h-11 min-w-[140px] flex-1 rounded-xl border border-black/10 bg-[#f8fafc] px-4 text-sm font-semibold text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20 disabled:opacity-50"
            />
            <button
              type="button"
              disabled={!hasIban || availableBalance <= 0 || submitting}
              onClick={() => setAmount(String(availableBalance))}
              className="h-11 rounded-xl border border-[#087a61]/30 bg-[#eef8f5] px-4 text-xs font-bold text-[#087a61] hover:bg-[#eef8f5] disabled:opacity-50"
            >
              Tümünü çek
            </button>
          </div>

          {error ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!hasIban || submitting || availableBalance <= 0}
            className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#087a61] text-sm font-bold text-white hover:bg-[#066b54] disabled:opacity-50 sm:w-auto sm:px-8"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Talep oluştur"
            )}
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Toplam talep", value: counts.all, tone: "text-[#083228]" },
          { label: "Bekleyen", value: counts.PENDING, tone: "text-amber-600" },
          {
            label: "İşlemde tutar",
            value: `₺${formatMoney(pendingTotal)}`,
            tone: "text-[#087a61]",
          },
          {
            label: "Ödenen toplam",
            value: `₺${formatMoney(paidTotal)}`,
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
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Talep filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "PENDING" as const, label: "Bekliyor" },
              { key: "APPROVED" as const, label: "Onaylı" },
              { key: "PAID" as const, label: "Ödendi" },
              { key: "REJECTED" as const, label: "Reddedildi" },
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
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#f8fcfa]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              {filter === "all"
                ? "Henüz ödeme talebiniz yok."
                : "Bu filtreye uygun talep yok."}
            </p>
            {filter === "all" && hasIban && availableBalance > 0 ? (
              <p className="mt-2 text-xs text-[#9ca3af]">
                Yukarıdaki formdan ilk çekim talebinizi oluşturabilirsiniz.
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((payout) => {
              const Icon = STATUS_ICONS[payout.status] ?? Clock;
              return (
                <li
                  key={payout.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/30 hover:bg-white"
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      payout.status === "PAID"
                        ? "bg-[#dcf7e7] text-[#10b981]"
                        : payout.status === "REJECTED"
                          ? "bg-red-50 text-red-600"
                          : "bg-[#eef8f5] text-[#087a61]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#083228]">
                        ₺{formatMoney(payout.amount)}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black",
                          STATUS_STYLES[payout.status] ?? "bg-slate-100 text-slate-600",
                        )}
                      >
                        {STATUS_LABELS[payout.status] ?? payout.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#5a7a72]">{payout.iban}</p>
                    <p className="mt-0.5 text-xs text-[#9ca3af]">
                      {formatDate(payout.createdAt)}
                    </p>
                    {payout.adminNote ? (
                      <p className="mt-1 text-xs text-amber-700">
                        Not: {payout.adminNote}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
