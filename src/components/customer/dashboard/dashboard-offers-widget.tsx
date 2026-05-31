import Link from "next/link";
import { ArrowRight, BadgeCheck, Sparkles, Star } from "lucide-react";
import {
  DashboardCard,
  dashboardWidgetBodyClass,
} from "@/components/customer/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

type OfferRow = {
  id: string;
  requestId: string;
  price: number;
  categoryName: string;
  providerName: string;
  ratingAvg: number | null;
  reviewCount: number;
};

export function DashboardOffersWidget({
  offers,
  fill,
  className,
}: {
  offers: OfferRow[];
  fill?: boolean;
  className?: string;
}) {
  return (
    <DashboardCard
      title="Son Teklifler"
      href={ROUTES.customer.offers}
      fill={fill}
      className={className}
    >
      <div className={cn(fill && dashboardWidgetBodyClass)}>
      {offers.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-black text-[#083228]">
            Henüz bekleyen teklif yok
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#53635f]">
            Talep oluşturduğunuzda ustalardan gelen teklifler burada görünür.
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3">
          {offers.map((offer) => (
            <li key={offer.id}>
              <Link
                href={`${ROUTES.customer.requests}/${offer.requestId}`}
                className="group block rounded-[24px] border border-black/5 bg-[#FBFDF5] p-4 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_14px_34px_rgba(8,50,40,0.07)]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-[#087a61] shadow-sm">
                    {offer.providerName.charAt(0)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-base font-black text-[#083228]">
                        {offer.providerName}
                      </p>

                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f5] px-2.5 py-1 text-[11px] font-black text-[#087a61]">
                        <BadgeCheck className="h-3.5 w-3.5" />
                        Onaylı
                      </span>
                    </div>

                    <p className="mt-1 text-xs font-medium text-[#53635f]">
                      {offer.categoryName}
                    </p>

                    {offer.ratingAvg != null ? (
                      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#53635f]">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {offer.ratingAvg} / 5
                        <span className="font-medium text-[#7b8b87]">
                          ({offer.reviewCount} yorum)
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xl font-black text-[#087a61]">
                      {offer.price.toLocaleString("tr-TR")} ₺
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#083228] transition group-hover:text-[#087a61]">
                      İncele
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>

      <Link
        href={ROUTES.customer.offers}
        className={cn(
          "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-[#087a61]/20 bg-white px-5 py-4 text-sm font-black text-[#087a61] transition hover:bg-[#eef8f5]",
          fill ? "mt-4 shrink-0" : "mt-5",
        )}
      >
        Tüm Teklifleri Gör
        <ArrowRight className="h-4 w-4" />
      </Link>
    </DashboardCard>
  );
}