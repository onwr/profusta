import Link from "next/link";
import {
  ArrowUpRight,
  Gauge,
  HeartHandshake,
  Percent,
  Timer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatDurationMinutes } from "@/lib/format/duration";
import { ROUTES } from "@/lib/constants";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { cn } from "@/lib/utils";

const BRAND = {
  primary: "#087a61",
  dark: "#083228",
  mint: "#eef8f5",
} as const;

function formatResponseTrend(minutesDelta: number) {
  const abs = Math.abs(minutesDelta);
  const label = formatDurationMinutes(abs);
  if (minutesDelta < 0) return `${label} hızlı`;
  if (minutesDelta > 0) return `${label} yavaş`;
  return null;
}

function formatAcceptanceTrend(delta: number) {
  if (delta === 0) return null;
  return delta > 0 ? `+%${delta}` : `-%${Math.abs(delta)}`;
}

function responseProgress(minutes: number | null) {
  if (minutes == null) return 0;
  return Math.max(8, Math.min(100, 100 - Math.min(minutes, 100)));
}

export function DashboardPerformance({
  performance,
}: {
  performance: ProviderDashboardData["performance"];
}) {
  const responseTrend =
    performance.responseTrendMinutes != null
      ? formatResponseTrend(performance.responseTrendMinutes)
      : null;

  const acceptanceTrend =
    performance.acceptanceTrend != null
      ? formatAcceptanceTrend(performance.acceptanceTrend)
      : null;

  const responseTrendPositive =
    performance.responseTrendMinutes != null &&
    performance.responseTrendMinutes < 0;

  const acceptanceTrendPositive =
    performance.acceptanceTrend != null && performance.acceptanceTrend > 0;

  const items = [
    {
      key: "response",
      label: "Yanıt süresi",
      value:
        performance.responseMinutes != null
          ? formatDurationMinutes(performance.responseMinutes)
          : "—",
      trend: responseTrend,
      trendPositive: responseTrendPositive,
      icon: Timer,
      iconBg: "bg-[#eef8f5] text-[#087a61]",
      bar: "bg-[#087a61]",
      progress: responseProgress(performance.responseMinutes),
    },
    {
      key: "acceptance",
      label: "Teklif kabul oranı",
      value:
        performance.acceptanceRate != null
          ? `%${performance.acceptanceRate}`
          : "—",
      trend: acceptanceTrend,
      trendPositive: acceptanceTrendPositive,
      icon: Percent,
      iconBg: "bg-[#e6f4f0] text-[#0a6b58]",
      bar: "bg-[#0a6b58]",
      progress: performance.acceptanceRate ?? 0,
    },
    {
      key: "satisfaction",
      label: "Müşteri memnuniyeti",
      value:
        performance.satisfactionPercent != null
          ? `%${performance.satisfactionPercent}`
          : "—",
      trend: null,
      trendPositive: true,
      icon: HeartHandshake,
      iconBg: "bg-[#fef9c3] text-[#ca8a04]",
      bar: "bg-[#ca8a04]",
      progress: performance.satisfactionPercent ?? 0,
    },
  ] as const;

  const hasAnyData = items.some((item) => item.value !== "—");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(8,122,97,0.1), transparent 38%)",
        }}
      />

      <div className="relative z-10 p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <h2
                className="text-[15px] font-black tracking-[-0.02em]"
                style={{ color: BRAND.dark }}
              >
                Performansım
              </h2>
              <p className="text-[11px] font-medium text-[#5a7a72]">
                {performance.responseSource === "messages"
                  ? "Mesaj · teklif · puan"
                  : performance.responseSource === "offers"
                    ? "Teklif · kabul · puan"
                    : "Yanıt · kabul · puan"}
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.provider.profile}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-black/8 bg-white px-2.5 text-[11px] font-black transition hover:border-[#087a61]/25 hover:bg-[#eef8f5]"
            style={{ color: BRAND.primary }}
          >
            Detay
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {!hasAnyData ? (
          <div className="rounded-[16px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-4 py-5 text-center">
            <p className="text-[12px] font-black text-[#083228]">
              Henüz performans verisi yok
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-[#5a7a72]">
              Mesaj ve teklif aktivitesi arttıkça burada görünür.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const Icon = item.icon;

              return (
                <li
                  key={item.key}
                  className="rounded-[14px] border border-black/5 bg-[#f8fcfa] px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
                        item.iconBg,
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-[11px] font-bold text-[#5a7a72]">
                          {item.label}
                        </p>
                        {item.trend ? (
                          <span
                            className={cn(
                              "inline-flex shrink-0 items-center gap-0.5 text-[9px] font-black",
                              item.trendPositive
                                ? "text-[#087a61]"
                                : "text-red-500",
                            )}
                          >
                            {item.trendPositive ? (
                              <TrendingUp className="h-2.5 w-2.5" />
                            ) : (
                              <TrendingDown className="h-2.5 w-2.5" />
                            )}
                            {item.trend}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[18px] font-black leading-none text-[#083228]">
                        {item.value}
                      </p>
                    </div>
                  </div>

                  {item.value !== "—" ? (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#d8ebe4]">
                      <div
                        className={cn("h-full rounded-full", item.bar)}
                        style={{
                          width: `${Math.max(0, Math.min(100, item.progress))}%`,
                        }}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
