import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  Clock3,
  MapPin,
  UserRound,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BRAND = {
  primary: "#087a61",
  dark: "#083228",
  mint: "#eef8f5",
} as const;

const AVATAR_GRADIENTS = [
  "from-[#064a3f] to-[#087a61]",
  "from-[#087a61] to-[#0a6b58]",
  "from-[#083228] to-[#064a3f]",
] as const;

const statusLabels: Record<string, string> = {
  PAID_ESCROW: "Onaylandı",
  PROVIDER_ACCEPTED: "Onaylandı",
  IN_PROGRESS: "Devam Ediyor",
  COMPLETED_BY_PROVIDER: "Onay Bekliyor",
};

const statusStyles: Record<string, string> = {
  PAID_ESCROW: "bg-[#eef8f5] text-[#087a61]",
  PROVIDER_ACCEPTED: "bg-[#eef8f5] text-[#087a61]",
  IN_PROGRESS: "bg-[#e6f4f0] text-[#0a6b58]",
  COMPLETED_BY_PROVIDER: "bg-[#fef9c3] text-[#ca8a04]",
};

function relativeDay(date: Date | null) {
  if (!date) return null;

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const time = date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffDays === 0) return `Bugün ${time}`;
  if (diffDays === 1) return `Yarın ${time}`;
  if (diffDays === -1) return `Dün ${time}`;

  return `${date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  })} ${time}`;
}

function formatCurrency(value: number) {
  return value.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

export function DashboardActiveJobs({
  jobs,
}: {
  jobs: ProviderDashboardData["activeJobs"];
}) {
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
                Aktif İşlerim
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#5a7a72]">
                {jobs.length > 0
                  ? `${jobs.length} devam eden iş`
                  : "Devam eden ve planlanan işler"}
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

        {jobs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[22px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-6 py-10 text-center">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <BriefcaseBusiness className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[14px] font-black text-[#083228]">
              Aktif iş yok
            </p>
            <p className="mt-1 max-w-[240px] text-[12px] font-medium text-[#5a7a72]">
              Kabul ettiğin işler burada listelenir.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {jobs.map((j, i) => {
              const initial = j.customerName.charAt(0).toUpperCase();
              const scheduledText = relativeDay(j.scheduledAt);
              const statusClass =
                statusStyles[j.status] ?? "bg-[#f0f4f2] text-[#5a7a72]";
              const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length];

              return (
                <li key={j.id}>
                  <article className="overflow-hidden rounded-[20px] border border-black/5 bg-[#f8fcfa]">
                    <div className="p-3.5">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-linear-to-br text-[14px] font-black text-white shadow-[0_8px_18px_rgba(8,122,97,0.22)]",
                            gradient,
                          )}
                        >
                          {initial}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className="text-[14px] font-black leading-snug text-[#083228]">
                              {j.title}
                            </p>
                            <p className="shrink-0 text-[16px] font-black text-[#083228]">
                              ₺{formatCurrency(j.amount)}
                            </p>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#5a7a72]">
                              <UserRound className="h-3.5 w-3.5 shrink-0 text-[#087a61]" />
                              {j.customerName}
                            </p>

                            {j.city ? (
                              <p className="flex items-start gap-1.5 text-[12px] font-medium text-[#5a7a72]">
                                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#087a61]" />
                                <span className="break-words">{j.city}</span>
                              </p>
                            ) : null}

                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#8aa39c]">
                              {scheduledText ? (
                                <>
                                  <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                  {scheduledText}
                                </>
                              ) : (
                                <>
                                  <Clock3 className="h-3.5 w-3.5 shrink-0" />
                                  Tarih bekleniyor
                                </>
                              )}
                            </p>
                          </div>

                          <div className="mt-2.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-1 text-[11px] font-black",
                                statusClass,
                              )}
                            >
                              {statusLabels[j.status] ?? j.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-black/5 bg-white px-3.5 py-2.5">
                      <Link
                        href={`${ROUTES.provider.jobs}/${j.id}`}
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[12px] font-black text-white shadow-[0_8px_20px_rgba(8,122,97,0.22)] transition hover:brightness-95"
                        style={{ backgroundColor: BRAND.primary }}
                      >
                        İşi Görüntüle
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
