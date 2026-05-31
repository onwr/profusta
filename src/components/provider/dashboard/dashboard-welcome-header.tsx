import Image from "next/image";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  Star,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type WelcomeProps = {
  firstName: string;
  profession: string;
  ratingAvg: number | null;
  stats: ProviderDashboardData["stats"];
  welcome: ProviderDashboardData["welcome"];
};

function formatTry(amount: number) {
  return `${amount.toLocaleString("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} ₺`;
}

function formatRatingValue(ratingStat: string, ratingAvg: number | null) {
  if (ratingAvg != null) return ratingAvg.toFixed(1);
  if (ratingStat === "—") return "—";
  const match = ratingStat.match(/^([\d.]+)/);
  return match?.[1] ?? "—";
}

export function DashboardWelcomeHeader({
  firstName,
  profession,
  ratingAvg,
  stats,
  welcome,
}: WelcomeProps) {
  const earningsTrend = welcome.periodEarningsTrend;
  const earningsLabel = `${welcome.rangeLabel.toUpperCase()} KAZANÇ`;

  return (
    <section className="overflow-hidden rounded-[20px] border border-black/5 bg-white shadow-[0_4px_24px_rgba(8,50,40,0.06)]">
      <div className="grid lg:grid-cols-[1fr_1fr]">
        {/* Sol panel */}
        <div className="flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-10 xl:py-10">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#087a61]/15 bg-[#eef8f5] px-3.5 py-1.5">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#087a61]" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#087a61]">
              {profession} · {welcome.rangeLabel}
            </span>
          </div>

          <h1 className="text-[32px] font-black leading-[1.08] tracking-tight text-[#083228] xl:text-[40px]">
            Hoş geldin, {firstName}
          </h1>

          <p className="mt-3 max-w-[400px] text-[14px] leading-7 text-[#53635f]">
            Yeni talepleri incele, tekliflerini yönet ve işlerini tek ekrandan
            takip et.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              href={ROUTES.provider.requests}
              className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-[#087a61] px-5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#066b54]"
            >
              <ClipboardList className="h-4 w-4" />
              Talepleri Gör
            </Link>
            <Link
              href={ROUTES.provider.listings}
              className="inline-flex h-[42px] items-center gap-2 rounded-xl border border-black/10 bg-white px-5 text-[13px] font-bold text-[#083228] transition hover:bg-[#f4f8f6]"
            >
              <LayoutGrid className="h-4 w-4 text-[#53635f]" />
              İlanlarımı Yönet
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <MiniStat
              icon={<ClipboardList className="h-[18px] w-[18px]" />}
              value={String(stats.newRequests.value)}
              label="Yeni Talep"
              tone="brand"
            />
            <MiniStat
              icon={<Briefcase className="h-[18px] w-[18px]" />}
              value={String(stats.activeJobs.value)}
              label="Aktif İş"
              tone="blue"
            />
            <MiniStat
              icon={<Wallet className="h-[18px] w-[18px]" />}
              value={formatTry(welcome.periodEarnings)}
              label={welcome.rangeLabel}
              tone="amber"
            />
            <MiniStat
              icon={<Star className="h-[18px] w-[18px]" />}
              value={formatRatingValue(stats.rating.value, ratingAvg)}
              label="Puan"
              tone="gold"
            />
          </div>
        </div>

        {/* Sağ panel — ustahero arka plan */}
        <div className="relative hidden min-h-[360px] overflow-hidden lg:block">
          <Image
            src="/ustahero.png"
            alt=""
            fill
            className="object-cover object-bottom-right"
            sizes="(max-width: 1024px) 0vw, 50vw"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#064a3f]/95 via-[#087a61]/75 to-[#087a61]/25"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-linear-to-t from-[#083228]/50 via-transparent to-transparent"
            aria-hidden
          />

          <div className="relative z-10 flex min-h-[360px] flex-col p-6 xl:p-8">
            {earningsTrend != null ? (
              <div
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm",
                  earningsTrend >= 0
                    ? "bg-[#083228]/35 text-[#d4f5e8]"
                    : "bg-[#083228]/45 text-white/90",
                )}
              >
                {earningsTrend >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {welcome.rangeLabel}{" "}
                {earningsTrend >= 0 ? "+" : ""}
                %{earningsTrend}
              </div>
            ) : null}

            <div className="mt-auto w-full max-w-[260px] space-y-3">
              <GlassStatCard
                icon={<Wallet className="h-5 w-5 text-white" />}
                label={earningsLabel}
                value={formatTry(welcome.periodEarnings)}
                sub={
                  welcome.prevPeriodEarnings > 0
                    ? `Önceki dönem: ${formatTry(welcome.prevPeriodEarnings)}`
                    : "İlk dönem kaydı"
                }
              />
              <GlassStatCard
                icon={<CheckCircle2 className="h-5 w-5 text-white" />}
                label="TAMAMLANAN İŞLER"
                value={String(stats.completedWeek.value)}
                sub={stats.completedWeek.sub}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

type MiniTone = "brand" | "blue" | "amber" | "gold";

const miniToneStyles: Record<MiniTone, { icon: string }> = {
  brand: { icon: "bg-[#eef8f5] text-[#087a61]" },
  blue: { icon: "bg-[#e8f0ff] text-[#3b82f6]" },
  amber: { icon: "bg-[#fff4e0] text-[#d97706]" },
  gold: { icon: "bg-[#fef9c3] text-[#ca8a04]" },
};

function MiniStat({
  icon,
  value,
  label,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  tone: MiniTone;
}) {
  return (
    <div className="rounded-[14px] border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div
        className={cn(
          "mb-3 grid h-9 w-9 place-items-center rounded-[10px]",
          miniToneStyles[tone].icon,
        )}
      >
        {icon}
      </div>
      <p className="text-[22px] font-black leading-none tracking-tight text-[#083228]">
        {value}
      </p>
      <p className="mt-2 text-[11px] font-semibold text-[#53635f]">{label}</p>
    </div>
  );
}

function GlassStatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex gap-3 rounded-[16px] border border-white/12 bg-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#087a61] shadow-[0_4px_12px_rgba(8,122,97,0.35)]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
          {label}
        </p>
        <p className="mt-1 text-[26px] font-black leading-none tracking-tight text-white">
          {value}
        </p>
        <p className="mt-1.5 text-[12px] font-medium text-white/45">{sub}</p>
      </div>
    </div>
  );
}
