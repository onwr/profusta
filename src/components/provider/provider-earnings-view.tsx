"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Wallet = {
  available: number;
  pending: number;
  totalEarned: number;
  withdrawn: number;
};

type Entry = {
  id: string;
  type: string;
  amount: number;
  note: string | null;
  createdAt: string;
  orderId: string | null;
  orderTitle: string | null;
};

type FilterKey = "all" | "CREDIT" | "PAYOUT" | "DEBIT";

const TYPE_LABELS: Record<string, string> = {
  CREDIT: "Kazanç",
  PAYOUT: "Çekim",
  DEBIT: "Düzeltme",
};

const TYPE_STYLES: Record<string, string> = {
  CREDIT: "bg-[#dcf7e7] text-[#10b981]",
  PAYOUT: "bg-[#eef8f5] text-[#087a61]",
  DEBIT: "bg-red-50 text-red-600",
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

export function ProviderEarningsView({
  wallet,
  entries,
  earningsByDay,
  loading,
}: {
  wallet: Wallet | null;
  entries: Entry[];
  earningsByDay: { label: string; amount: number }[];
  loading: boolean;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showBalance, setShowBalance] = useState(true);

  const counts = useMemo(
    () => ({
      all: entries.length,
      CREDIT: entries.filter((e) => e.type === "CREDIT").length,
      PAYOUT: entries.filter((e) => e.type === "PAYOUT").length,
      DEBIT: entries.filter((e) => e.type === "DEBIT").length,
    }),
    [entries],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter((e) => e.type === filter);
  }, [entries, filter]);

  const weekTotal = earningsByDay.reduce((s, d) => s + d.amount, 0);
  const maxDay = Math.max(...earningsByDay.map((d) => d.amount), 1);

  const mask = "•••••";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Kazançlarım
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Bakiye hareketleri ve kazanç geçmişiniz
          </p>
        </div>
        <Link
          href={ROUTES.provider.payouts}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087a61] px-5 text-sm font-bold text-white hover:bg-[#066b54]"
        >
          <Wallet className="h-4 w-4" />
          Para çek
        </Link>
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
            ₺{showBalance && wallet ? formatMoney(wallet.available) : mask}
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/60">Bekleyen</dt>
              <dd className="font-bold">
                ₺{showBalance && wallet ? formatMoney(wallet.pending) : mask}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/60">Toplam kazanç</dt>
              <dd className="font-bold">
                ₺{showBalance && wallet ? formatMoney(wallet.totalEarned) : mask}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/60">Çekilen</dt>
              <dd className="font-bold">
                ₺{showBalance && wallet ? formatMoney(wallet.withdrawn) : mask}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[15px] font-black text-[#083228]">Son 7 gün</p>
              <p className="text-xs text-[#5a7a72]">
                Haftalık kazanç: ₺{formatMoney(weekTotal)}
              </p>
            </div>
            <p className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981]">
              <TrendingUp className="h-3.5 w-3.5" />
              Bu hafta
            </p>
          </div>
          <div className="flex h-32 items-end gap-2">
            {earningsByDay.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#087a61]/80 transition-all"
                  style={{
                    height: `${Math.max(8, (d.amount / maxDay) * 100)}%`,
                  }}
                  title={`₺${formatMoney(d.amount)}`}
                />
                <span className="text-[10px] font-semibold capitalize text-[#9ca3af]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Kullanılabilir",
            value: wallet?.available ?? 0,
            tone: "text-[#087a61]",
          },
          { label: "Bekleyen", value: wallet?.pending ?? 0, tone: "text-amber-600" },
          {
            label: "Toplam kazanç",
            value: wallet?.totalEarned ?? 0,
            tone: "text-[#10b981]",
          },
          { label: "Çekilen", value: wallet?.withdrawn ?? 0, tone: "text-[#083228]" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs font-semibold text-[#5a7a72]">{stat.label}</p>
            <p className={cn("mt-1 text-xl font-black", stat.tone)}>
              {loading ? "—" : `₺${formatMoney(stat.value)}`}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Hareket filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "CREDIT" as const, label: "Kazançlar" },
              { key: "PAYOUT" as const, label: "Çekimler" },
              { key: "DEBIT" as const, label: "Diğer" },
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
              <div key={i} className="h-16 animate-pulse rounded-xl bg-[#f8fcfa]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <p className="text-sm font-semibold text-[#5a7a72]">
              Henüz bakiye hareketi yok.
            </p>
            <p className="mt-2 text-xs text-[#9ca3af]">
              Tamamlanan işlerden sonra kazançlar burada görünür.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((entry) => {
              const isCredit = entry.type === "CREDIT";
              const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;
              return (
                <li
                  key={entry.id}
                  className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5 bg-[#f8fafc] p-4"
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 place-items-center rounded-xl",
                      isCredit
                        ? "bg-[#dcf7e7] text-[#10b981]"
                        : "bg-[#eef8f5] text-[#087a61]",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#083228]">
                        {entry.orderTitle ??
                          entry.note ??
                          TYPE_LABELS[entry.type] ??
                          entry.type}
                      </p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-black",
                          TYPE_STYLES[entry.type] ?? "bg-slate-100 text-slate-600",
                        )}
                      >
                        {TYPE_LABELS[entry.type] ?? entry.type}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-[#5a7a72]">
                      {formatDate(entry.createdAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={cn(
                        "text-lg font-black",
                        isCredit ? "text-[#10b981]" : "text-[#083228]",
                      )}
                    >
                      {isCredit ? "+" : "−"}₺{formatMoney(entry.amount)}
                    </p>
                    {entry.orderId ? (
                      <Link
                        href={`${ROUTES.provider.jobs}/${entry.orderId}`}
                        className="text-xs font-bold text-[#087a61] hover:underline"
                      >
                        İş detayı
                      </Link>
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
