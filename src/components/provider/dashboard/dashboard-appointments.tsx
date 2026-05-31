import Link from "next/link";
import {
  ArrowUpRight,
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

function formatDateParts(date: Date) {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString("tr-TR", { day: "numeric" }),
    month: d.toLocaleDateString("tr-TR", { month: "short" }),
    time: d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

export function DashboardAppointments({
  appointments,
}: {
  appointments: ProviderDashboardData["appointments"];
}) {
  const todayCount = appointments.filter((a) => a.isToday).length;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top left, rgba(8,122,97,0.1), transparent 38%)",
        }}
      />

      <div className="relative z-10 flex flex-col p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="grid h-10 w-10 place-items-center rounded-2xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-[17px] font-black tracking-[-0.02em]"
                style={{ color: BRAND.dark }}
              >
                Yaklaşan Randevular
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#5a7a72]">
                {appointments.length > 0
                  ? todayCount > 0
                    ? `${todayCount} bugün · ${appointments.length} planlı`
                    : `${appointments.length} planlı randevu`
                  : "Planlanmış işler ve ziyaretler"}
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

        {appointments.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-5 py-7 text-center">
            <div
              className="mx-auto grid h-10 w-10 place-items-center rounded-xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <CalendarClock className="h-4 w-4" />
            </div>
            <p className="mt-3 text-[13px] font-black text-[#083228]">
              Yaklaşan randevu yok
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-[#5a7a72]">
              Tarihli aktif işler burada listelenir.
            </p>
          </div>
        ) : (
          <ul className="scrollbar-sidebar max-h-[248px] space-y-2 overflow-y-auto overscroll-contain pr-0.5">
            {appointments.map((a) => {
              const { day, month, time } = formatDateParts(a.scheduledAt);

              return (
                <li key={a.id}>
                  <Link
                    href={`${ROUTES.provider.jobs}/${a.id}`}
                    className="flex gap-2.5 rounded-[16px] border border-black/5 bg-[#f8fcfa] p-2.5 transition hover:border-[#087a61]/20 hover:bg-white"
                  >
                    <div className="flex w-[44px] shrink-0 flex-col overflow-hidden rounded-lg border border-black/5 bg-white text-center">
                      <div
                        className="py-0.5 text-[8px] font-black uppercase tracking-wide text-white/80"
                        style={{ backgroundColor: BRAND.dark }}
                      >
                        {month}
                      </div>
                      <div className="flex items-center justify-center py-1.5">
                        <span
                          className="text-[18px] font-black leading-none"
                          style={{ color: BRAND.dark }}
                        >
                          {day}
                        </span>
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="min-w-0 flex-1 truncate text-[13px] font-black text-[#083228]">
                          {a.title}
                        </p>
                        {a.isToday || a.isTomorrow ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-black",
                              a.isToday
                                ? "bg-[#087a61]/12 text-[#066b54]"
                                : "bg-[#fef9c3] text-[#ca8a04]",
                            )}
                          >
                            {a.isToday ? "Bugün" : "Yarın"}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#5a7a72]">
                        <Clock3 className="h-3 w-3 shrink-0 text-[#087a61]" />
                        {time}
                        <span className="text-[#c5d5d0]">·</span>
                        <UserRound className="h-3 w-3 shrink-0 text-[#087a61]" />
                        <span className="truncate">{a.customerName}</span>
                      </p>

                      {a.city ? (
                        <p className="mt-0.5 flex items-center gap-1 text-[10px] font-medium text-[#8aa39c]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{a.city}</span>
                        </p>
                      ) : null}
                    </div>

                    <ArrowUpRight className="mt-1 h-3.5 w-3.5 shrink-0 self-start text-[#087a61]/50" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
