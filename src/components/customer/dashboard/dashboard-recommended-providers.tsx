import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { DashboardCard } from "@/components/customer/dashboard/dashboard-card";
import type { DashboardProviderCard } from "@/lib/customer/dashboard-data";
import { ROUTES } from "@/lib/constants";

export function DashboardRecommendedProviders({
  providers,
}: {
  providers: DashboardProviderCard[];
}) {
  return (
    <DashboardCard title="Önerilen Ustalar" href={ROUTES.providers}>
      {providers.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-black text-[#083228]">
            Konumunuza uygun usta bulunamadı
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#53635f]">
            Tüm ustaları inceleyerek size en yakın hizmet sağlayıcıyı
            bulabilirsiniz.
          </p>

          <Link
            href={ROUTES.providers}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#087a61] px-5 text-sm font-black text-white"
          >
            Tüm Ustaları Gör
          </Link>
        </div>
      ) : (
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin">
          {providers.map((provider) => (
            <article
              key={provider.id}
              className="group w-[min(260px,78vw)] shrink-0 rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-1 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_18px_42px_rgba(8,50,40,0.08)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-xl font-black text-[#087a61] shadow-sm">
                  {provider.fullName.charAt(0)}
                </div>

                <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f5] px-2.5 py-1 text-[11px] font-black text-[#087a61]">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Onaylı
                </span>
              </div>

              <h3 className="mt-4 line-clamp-1 text-base font-black text-[#083228]">
                {provider.fullName}
              </h3>

              <div className="mt-3 space-y-2">
                {provider.ratingAvg != null ? (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#53635f]">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {provider.ratingAvg} / 5
                    <span className="font-medium text-[#7b8b87]">
                      ({provider.reviewCount} yorum)
                    </span>
                  </p>
                ) : null}

                {provider.distanceKm != null ? (
                  <p className="flex items-center gap-1.5 text-xs font-bold text-[#53635f]">
                    <MapPin className="h-4 w-4 text-[#087a61]" />
                    {provider.distanceKm} km yakınınızda
                  </p>
                ) : null}
              </div>

              <div className="mt-5 grid grid-cols-[1fr_48px] gap-2">
                <Link
                  href={`${ROUTES.providers}/${provider.slug ?? provider.id}`}
                  className="flex h-12 items-center justify-center rounded-2xl border border-[#087a61]/20 bg-white text-sm font-black text-[#087a61] transition group-hover:bg-[#eef8f5]"
                >
                  Profili Gör
                </Link>

                <Link
                  href={`${ROUTES.providers}/${provider.slug ?? provider.id}#mesaj`}
                  className="grid h-12 place-items-center rounded-2xl bg-[#087a61] text-white shadow-[0_12px_28px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
                  aria-label="Mesaj"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        href={ROUTES.providers}
        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-[#087a61]/20 bg-white px-5 py-4 text-sm font-black text-[#087a61] transition hover:bg-[#eef8f5]"
      >
        Tüm Ustaları Gör
        <ArrowRight className="h-4 w-4" />
      </Link>
    </DashboardCard>
  );
}