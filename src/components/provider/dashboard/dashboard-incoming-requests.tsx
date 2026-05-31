import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  Clock3,
  Inbox,
  MapPin,
  Navigation,
} from "lucide-react";
import type { ProviderDashboardData } from "@/lib/provider/dashboard-data";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const BRAND = {
  primary: "#087a61",
  dark: "#083228",
  mint: "#eef8f5",
} as const;

const ICON_TONES = [
  { bg: "bg-[#eef8f5]", text: "text-[#087a61]" },
  { bg: "bg-[#e6f4f0]", text: "text-[#0a6b58]" },
  { bg: "bg-[#fef9c3]", text: "text-[#ca8a04]" },
  { bg: "bg-[#dcf7e7]", text: "text-[#066b54]" },
] as const;

function timeAgo(date: Date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));

  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

function formatLocation(city: string, district: string | null) {
  return district ? `${city}, ${district}` : city;
}

export function DashboardIncomingRequests({
  requests,
}: {
  requests: ProviderDashboardData["incomingRequests"];
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
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-[17px] font-black tracking-[-0.02em]"
                style={{ color: BRAND.dark }}
              >
                Gelen Talepler
              </h2>
              <p className="mt-0.5 text-[12px] font-medium text-[#5a7a72]">
                {requests.length > 0
                  ? `${requests.length} açık talep`
                  : "Yakındaki açık müşteri talepleri"}
              </p>
            </div>
          </div>

          <Link
            href={ROUTES.provider.requests}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-black/8 bg-white px-3 text-[12px] font-black transition hover:border-[#087a61]/25 hover:bg-[#eef8f5]"
            style={{ color: BRAND.primary }}
          >
            Tümünü Gör
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[22px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-6 py-10 text-center">
            <div
              className="grid h-12 w-12 place-items-center rounded-2xl"
              style={{ backgroundColor: BRAND.mint, color: BRAND.primary }}
            >
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="mt-4 text-[14px] font-black text-[#083228]">
              Yeni açık talep yok
            </p>
            <p className="mt-1 max-w-[240px] text-[12px] font-medium text-[#5a7a72]">
              Bölgenize uygun talepler geldiğinde burada listelenir.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {requests.map((r, i) => {
              const tone = ICON_TONES[i % ICON_TONES.length];

              return (
                <li key={r.id}>
                  <article className="overflow-hidden rounded-[20px] border border-black/5 bg-[#f8fcfa]">
                    <div className="p-3.5">
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                            tone.bg,
                            tone.text,
                          )}
                        >
                          <Briefcase className="h-5 w-5" />
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-black leading-snug text-[#083228]">
                            {r.categoryName}
                          </p>

                          <div className="mt-2 space-y-1.5">
                            <p className="flex items-start gap-1.5 text-[12px] font-medium text-[#5a7a72]">
                              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#087a61]" />
                              <span className="break-words">
                                {formatLocation(r.city, r.district)}
                              </span>
                            </p>
                            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#8aa39c]">
                              <Clock3 className="h-3.5 w-3.5 shrink-0" />
                              {timeAgo(r.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f5] px-2.5 py-1 text-[11px] font-black text-[#087a61]">
                          <Navigation className="h-3 w-3" />
                          {r.distanceKm.toFixed(1)} km
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-black/5 bg-white px-3.5 py-2.5">
                      <Link
                        href={`${ROUTES.provider.requests}/${r.id}`}
                        className="flex h-10 w-full items-center justify-center gap-1.5 rounded-xl text-[12px] font-black text-white shadow-[0_8px_20px_rgba(8,122,97,0.22)] transition hover:brightness-95"
                        style={{ backgroundColor: BRAND.primary }}
                      >
                        Teklif Ver
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
