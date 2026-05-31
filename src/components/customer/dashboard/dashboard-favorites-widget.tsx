import Link from "next/link";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  Sparkles,
  Star,
} from "lucide-react";
import { DashboardCard } from "@/components/customer/dashboard/dashboard-card";
import type { DashboardProviderCard } from "@/lib/customer/dashboard-data";
import { ROUTES } from "@/lib/constants";

export function DashboardFavoritesWidget({
  favorites,
}: {
  favorites: DashboardProviderCard[];
}) {
  return (
    <DashboardCard title="Favori Ustalarım" href={ROUTES.customer.favorites}>
      {favorites.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-black text-[#083228]">
            Henüz favori ustanız yok
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#53635f]">
            Beğendiğiniz ustaları favorilere ekleyerek daha sonra kolayca ulaşabilirsiniz.
          </p>

          <Link
            href={ROUTES.providers}
            className="mt-5 inline-flex h-11 items-center justify-center rounded-2xl bg-[#087a61] px-5 text-sm font-black text-white"
          >
            Ustaları Keşfet
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {favorites.map((favorite) => (
            <li key={favorite.id}>
              <Link
                href={`${ROUTES.providers}/${favorite.slug ?? favorite.id}`}
                className="group flex items-center gap-4 rounded-[22px] border border-black/5 bg-[#FBFDF5] p-4 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_14px_34px_rgba(8,50,40,0.07)]"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-[#087a61] shadow-sm">
                  {favorite.fullName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-base font-black text-[#083228]">
                      {favorite.fullName}
                    </p>

                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </div>

                  {favorite.ratingAvg != null ? (
                    <p className="mt-1 flex items-center gap-1 text-xs font-bold text-[#53635f]">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {favorite.ratingAvg} / 5
                      <span className="font-medium text-[#7b8b87]">
                        ({favorite.reviewCount} yorum)
                      </span>
                    </p>
                  ) : (
                    <p className="mt-1 text-xs font-medium text-[#53635f]">
                      Henüz değerlendirme yok
                    </p>
                  )}
                </div>

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61] transition group-hover:bg-[#087a61] group-hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={ROUTES.customer.favorites}
        className="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-[#087a61]/20 bg-white px-5 py-4 text-sm font-black text-[#087a61] transition hover:bg-[#eef8f5]"
      >
        Tüm Favorileri Gör
        <ArrowRight className="h-4 w-4" />
      </Link>
    </DashboardCard>
  );
}