import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Sparkles,
} from "lucide-react";
import {
  DashboardCard,
  dashboardWidgetBodyClass,
} from "@/components/customer/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { DashboardStatusBadge } from "@/components/customer/dashboard/dashboard-status-badge";
import { ROUTES } from "@/lib/constants";

type RequestRow = {
  id: string;
  categoryName: string;
  city: string;
  district: string | null;
  createdAt: Date;
  offerCount: number;
  status: string;
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours < 24) return `${hours || 1} saat önce`;

  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
}

export function DashboardRequestsWidget({
  requests,
  fill,
  className,
}: {
  requests: RequestRow[];
  fill?: boolean;
  className?: string;
}) {
  return (
    <DashboardCard
      title="Hizmet Taleplerim"
      href={ROUTES.customer.requests}
      fill={fill}
      className={className}
    >
      <div className={cn(fill && dashboardWidgetBodyClass)}>
      {requests.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-black text-[#083228]">
            Henüz açık talebiniz yok
          </h3>

          <p className="mx-auto mt-2 max-w-[320px] text-sm leading-6 text-[#53635f]">
            İhtiyacınız olan hizmeti seçerek hemen teklif almaya başlayın.
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3">
          {requests.map((request) => (
            <li key={request.id}>
              <Link
                href={`${ROUTES.customer.requests}/${request.id}`}
                className="group flex items-center gap-4 rounded-[22px] border border-black/5 bg-[#FBFDF5] p-4 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_14px_34px_rgba(8,50,40,0.07)]"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-lg font-black text-[#087a61] shadow-sm">
                  {request.categoryName.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-black text-[#083228]">
                      {request.categoryName}
                    </p>

                    <DashboardStatusBadge status={request.status} />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-[#53635f]">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                      {request.district
                        ? `${request.city}, ${request.district}`
                        : request.city}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#087a61]" />
                      {timeAgo(request.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#087a61]">
                    {request.offerCount} teklif
                  </span>

                  <span className="inline-flex items-center text-xs font-black text-[#083228] transition group-hover:text-[#087a61]">
                    Detay
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      </div>

      <Link
        href={ROUTES.createRequest}
        className={cn(
          "flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-5 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]",
          fill ? "mt-4 shrink-0" : "mt-5",
        )}
      >
        <Plus className="h-4 w-4" />
        Yeni Talep Oluştur
        <ArrowRight className="h-4 w-4" />
      </Link>
    </DashboardCard>
  );
}