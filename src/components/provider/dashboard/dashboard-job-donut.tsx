import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SEGMENTS = {
  completed: "#087a61",
  active: "#0a6b58",
  offer: "#ca8a04",
} as const;

const BRAND = {
  primary: "#087a61",
  dark: "#083228",
  mint: "#eef8f5",
} as const;

function buildConicGradient(
  completed: number,
  active: number,
  offerStage: number,
  total: number,
) {
  if (total === 0) {
    return "conic-gradient(#d8ebe4 0% 100%)";
  }

  const cPct = (completed / total) * 100;
  const aPct = (active / total) * 100;

  return `conic-gradient(
    ${SEGMENTS.completed} 0% ${cPct}%,
    ${SEGMENTS.active} ${cPct}% ${cPct + aPct}%,
    ${SEGMENTS.offer} ${cPct + aPct}% 100%
  )`;
}

export function DashboardJobDonut({
  distribution,
}: {
  distribution: ProviderDashboardData["jobDistribution"];
}) {
  const { completed, active, offerStage, rangeLabel } = distribution;
  const total = completed + active + offerStage;
  const safeTotal = total || 1;

  const cPct = Math.round((completed / safeTotal) * 100);
  const aPct = Math.round((active / safeTotal) * 100);
  const oPct = Math.round((offerStage / safeTotal) * 100);

  const gradient = buildConicGradient(completed, active, offerStage, total);

  const legend = [
    {
      key: "completed",
      label: "Tamamlanan",
      description: `${rangeLabel} tamamlanan işler`,
      value: completed,
      pct: cPct,
      color: SEGMENTS.completed,
      icon: CheckCircle2,
      iconBg: "bg-[#eef8f5]",
      iconText: "text-[#087a61]",
      bar: "bg-[#087a61]",
    },
    {
      key: "active",
      label: "Devam Eden",
      description: "Şu an aktif işler",
      value: active,
      pct: aPct,
      color: SEGMENTS.active,
      icon: Clock3,
      iconBg: "bg-[#e6f4f0]",
      iconText: "text-[#0a6b58]",
      bar: "bg-[#0a6b58]",
    },
    {
      key: "offer",
      label: "Teklif Aşamasında",
      description: "Yanıt bekleyen teklifler",
      value: offerStage,
      pct: oPct,
      color: SEGMENTS.offer,
      icon: FileText,
      iconBg: "bg-[#fef9c3]",
      iconText: "text-[#ca8a04]",
      bar: "bg-[#ca8a04]",
    },
  ] as const;

  return (
    <section className="relative h-full overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(8,122,97,0.1), transparent 38%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-[17px] font-black tracking-[-0.02em]"
                style={{ color: BRAND.dark }}
              >
                İş Dağılımı
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#5a7a72]">
                {rangeLabel} özet dağılımı
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.provider.jobs}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-black/8 bg-white px-3 text-[12px] font-black transition hover:border-[#087a61]/25 hover:bg-[#eef8f5]"
            style={{ color: BRAND.primary }}
          >
            Tümünü Gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-1 flex-col items-center gap-5">
          <div className="flex justify-center py-1">
            <div className="relative">
              <div
                className="relative h-[168px] w-[168px] rounded-full shadow-[inset_0_0_0_1px_rgba(8,50,40,0.06)]"
                style={{ background: gradient }}
              >
                <div className="absolute inset-[20px] flex flex-col items-center justify-center rounded-full border border-black/5 bg-white text-center shadow-[0_14px_32px_rgba(8,50,40,0.08)]">
                  <span
                    className="text-[36px] font-black leading-none tracking-tighter"
                    style={{ color: BRAND.dark }}
                  >
                    {total}
                  </span>
                  <span className="mt-1.5 text-[11px] font-bold text-[#5a7a72]">
                    Toplam Kayıt
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2.5">
            {total === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-4 py-6 text-center">
                <p className="text-[13px] font-bold text-[#083228]">
                  Henüz iş kaydı yok
                </p>
                <p className="mt-1 text-[11px] text-[#5a7a72]">
                  Aktif iş, teklif veya tamamlanan iş oluştuğunda burada
                  görünür.
                </p>
              </div>
            ) : (
              legend.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.key}
                    className="rounded-[18px] border border-black/5 bg-[#f8fcfa] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                          item.iconBg,
                          item.iconText,
                        )}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-black text-[#083228]">
                            {item.label}
                          </p>
                          <p className="shrink-0 text-[16px] font-black leading-none text-[#083228]">
                            {item.value}
                          </p>
                        </div>
                        <p className="mt-0.5 truncate text-[10px] font-medium text-[#8aa39c]">
                          {item.description}
                        </p>
                      </div>

                      <span className="shrink-0 text-[11px] font-black text-[#087a61]">
                        %{item.pct}
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#d8ebe4]">
                      <div
                        className={cn("h-full rounded-full transition-all", item.bar)}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
