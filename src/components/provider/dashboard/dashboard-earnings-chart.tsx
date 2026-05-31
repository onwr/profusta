"use client";

import { useId } from "react";
import { ArrowUpRight, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BRAND = {
  primary: "#087a61",
  dark: "#083228",
  mint: "#eef8f5",
  grid: "#d8ebe4",
} as const;

function formatCurrency(value: number) {
  return value.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatAxis(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
    })}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("tr-TR", {
      maximumFractionDigits: 1,
    })}K`;
  }
  return `${Math.round(value)}`;
}

function niceChartMax(maxValue: number) {
  if (maxValue <= 0) return 100;
  const exp = Math.floor(Math.log10(maxValue));
  const magnitude = 10 ** exp;
  const normalized = maxValue / magnitude;
  let nice: number;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * magnitude;
}

function getXAxisTickStep(len: number) {
  if (len <= 1) return 1;
  if (len <= 7) return 1;
  if (len <= 14) return 2;
  if (len <= 21) return 3;
  if (len <= 31) return 5;
  return 7;
}

export type DashboardEarningsChartProps = {
  data: ProviderDashboardData["earningsByDay"];
  earningsTitle: string;
  summary: ProviderDashboardData["welcome"];
  prevPeriodLabel: string;
  comparisonHint: string;
};

export function DashboardEarningsChart({
  data,
  earningsTitle,
  summary,
  prevPeriodLabel,
  comparisonHint,
}: DashboardEarningsChartProps) {
  const gradId = useId().replace(/:/g, "");

  const periodTotal = summary.periodEarnings;
  const prevPeriodTotal = summary.prevPeriodEarnings;
  const trend = summary.periodEarningsTrend;
  const isPositiveTrend = trend == null || trend >= 0;
  const hasChartData = data.some((d) => d.amount > 0);

  const maxValue = Math.max(...data.map((d) => d.amount), 0);
  const niceMax = niceChartMax(maxValue);
  const ticks = [niceMax, niceMax * 0.75, niceMax * 0.5, niceMax * 0.25, 0];

  const chartWidth = 100;
  const chartHeight = 84;

  const points = data.map((d, i) => {
    const x =
      data.length > 1 ? (i / (data.length - 1)) * chartWidth : chartWidth / 2;
    const y =
      chartHeight -
      (niceMax > 0 ? (d.amount / niceMax) * chartHeight : chartHeight);
    return { x, y };
  });

  const linePath = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath = `0,${chartHeight} ${linePath} ${chartWidth},${chartHeight}`;

  const tickStep = getXAxisTickStep(data.length);
  const xTicks = data.filter(
    (_, i) => i === 0 || i === data.length - 1 || i % tickStep === 0,
  );

  const contentKey = `${earningsTitle}-${data.length}-${periodTotal}-${prevPeriodTotal}`;

  return (
    <section className="relative h-full overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at top left, rgba(8,122,97,0.1), transparent 38%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-[17px] font-black tracking-[-0.02em]"
                style={{ color: BRAND.dark }}
              >
                Kazanç Özeti
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#5a7a72]">
                {summary.rangeLabel} gelir performansı
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.provider.earnings}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-black/8 bg-white px-3 text-[12px] font-black transition hover:border-[#087a61]/25 hover:bg-[#eef8f5]"
            style={{ color: BRAND.primary }}
          >
            Tümünü Gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={contentKey}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-1 flex-col"
          >
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              <div
                className="rounded-[22px] border p-4 sm:col-span-2"
                style={{
                  borderColor: "rgba(8,122,97,0.12)",
                  backgroundColor: BRAND.mint,
                }}
              >
                <p className="text-[12px] font-bold text-[#5a7a72]">
                  {earningsTitle}
                </p>
                <p
                  className="mt-2 text-[34px] font-black leading-none tracking-[-0.05em]"
                  style={{ color: BRAND.dark }}
                >
                  ₺{formatCurrency(periodTotal)}
                </p>
                {trend != null ? (
                  <div
                    className={cn(
                      "mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black",
                      isPositiveTrend
                        ? "bg-[#087a61]/12 text-[#066b54]"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {isPositiveTrend ? (
                      <TrendingUp className="h-3.5 w-3.5" />
                    ) : (
                      <TrendingDown className="h-3.5 w-3.5" />
                    )}
                    {trend >= 0 ? "+" : ""}
                    {trend}% {comparisonHint}
                  </div>
                ) : periodTotal > 0 ? (
                  <p className="mt-3 text-[12px] font-semibold text-[#087a61]">
                    İlk dönem kazancınız
                  </p>
                ) : (
                  <p className="mt-3 text-[12px] font-semibold text-[#8aa39c]">
                    Bu dönemde henüz kazanç yok
                  </p>
                )}
              </div>

              <div
                className="rounded-[22px] p-4 text-white"
                style={{
                  background: `linear-gradient(145deg, #064a3f 0%, ${BRAND.dark} 100%)`,
                }}
              >
                <p className="text-[11px] font-bold text-white/55">
                  {prevPeriodLabel}
                </p>
                <p className="mt-2 text-[22px] font-black tracking-[-0.04em]">
                  ₺{formatCurrency(prevPeriodTotal)}
                </p>
                <p className="mt-3 text-[11px] font-medium text-white/55">
                  Karşılaştırma dönemi
                </p>
              </div>
            </div>

            <div className="relative flex flex-1 gap-3 rounded-[24px] border border-black/5 bg-white p-4">
              <div className="relative min-h-[190px] flex-1 overflow-hidden">
                {hasChartData ? (
                  <>
                    <svg
                      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                      preserveAspectRatio="none"
                      className="h-[190px] w-full overflow-hidden"
                      aria-hidden
                    >
                      <defs>
                        <linearGradient
                          id={gradId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={BRAND.primary}
                            stopOpacity="0.35"
                          />
                          <stop
                            offset="48%"
                            stopColor={BRAND.primary}
                            stopOpacity="0.14"
                          />
                          <stop
                            offset="100%"
                            stopColor={BRAND.primary}
                            stopOpacity="0"
                          />
                        </linearGradient>
                      </defs>

                      {[0, 25, 50, 75, 100].map((y) => (
                        <line
                          key={y}
                          x1="0"
                          x2={chartWidth}
                          y1={y}
                          y2={y}
                          stroke={BRAND.grid}
                          strokeWidth="0.45"
                          vectorEffect="non-scaling-stroke"
                        />
                      ))}

                      <polygon fill={`url(#${gradId})`} points={areaPath} />

                      <polyline
                        fill="none"
                        stroke={BRAND.primary}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                        points={linePath}
                      />

                      {data.length <= 14
                        ? points.map((p, i) => (
                            <circle
                              key={i}
                              cx={p.x}
                              cy={p.y}
                              r="2.8"
                              fill="#ffffff"
                              stroke={BRAND.primary}
                              strokeWidth="2.2"
                              vectorEffect="non-scaling-stroke"
                            />
                          ))
                        : null}
                    </svg>

                    <div
                      className={cn(
                        "mt-2 flex justify-between gap-2 text-[10px] font-bold text-[#8aa39c]",
                        data.length > 14 && "text-[9px]",
                      )}
                    >
                      {xTicks.map((d, i) => (
                        <span
                          key={`${d.label}-${i}`}
                          className="max-w-[72px] truncate text-center capitalize"
                        >
                          {d.label}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex h-[190px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-4 text-center">
                    <p className="text-[13px] font-bold text-[#083228]">
                      Grafik verisi yok
                    </p>
                    <p className="mt-1 max-w-[220px] text-[11px] text-[#5a7a72]">
                      Tamamlanan işlerden kazanç oluştuğunda günlük dağılım
                      burada görünür.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex w-10 shrink-0 flex-col justify-between py-1 text-right text-[10px] font-bold text-[#8aa39c]">
                {ticks.map((t) => (
                  <span key={t}>{formatAxis(t)}</span>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
