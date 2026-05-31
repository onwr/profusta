import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react";
import {
  DashboardCard,
  dashboardWidgetBodyClass,
} from "@/components/customer/dashboard/dashboard-card";
import { cn } from "@/lib/utils";
import { DashboardStatusBadge } from "@/components/customer/dashboard/dashboard-status-badge";
import { ROUTES } from "@/lib/constants";

type UpcomingRow = {
  id: string;
  title: string;
  status: string;
  providerName: string;
  scheduledAt: Date | null;
  city: string | null;
  amount: number;
};

export function DashboardUpcomingWidget({
  orders,
  fill,
  className,
}: {
  orders: UpcomingRow[];
  fill?: boolean;
  className?: string;
}) {
  return (
    <DashboardCard
      title="Yaklaşan Hizmetlerim"
      href={ROUTES.customer.orders}
      fill={fill}
      className={className}
    >
      <div className={cn(fill && dashboardWidgetBodyClass)}>
      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-6 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-7 w-7" />
          </div>

          <h3 className="mt-4 text-base font-black text-[#083228]">
            Yaklaşan aktif sipariş yok
          </h3>

          <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-[#53635f]">
            Hizmet satın aldığınızda randevu ve takip bilgileri burada görünür.
          </p>
        </div>
      ) : (
        <ul className="flex-1 space-y-3">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`${ROUTES.customer.orders}/${order.id}`}
                className="group block rounded-[24px] border border-black/5 bg-[#FBFDF5] p-4 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_14px_34px_rgba(8,50,40,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-[#087a61] shadow-sm">
                      <Calendar className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-base font-black text-[#083228]">
                          {order.title}
                        </p>
                        <DashboardStatusBadge status={order.status} />
                      </div>

                      <p className="mt-1 text-xs font-medium text-[#53635f]">
                        {order.providerName}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-medium text-[#53635f]">
                        {order.city ? (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                            {order.city}
                          </span>
                        ) : null}

                        {order.scheduledAt ? (
                          <>
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
                              {order.scheduledAt.toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-[#087a61]" />
                              {order.scheduledAt.toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-xl font-black text-[#087a61]">
                      {order.amount.toLocaleString("tr-TR")} ₺
                    </p>

                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-black text-[#083228] transition group-hover:text-[#087a61]">
                      Takip Et
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
        href={ROUTES.customer.orders}
        className={cn(
          "flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-[#087a61]/20 bg-white px-5 py-4 text-sm font-black text-[#087a61] transition hover:bg-[#eef8f5]",
          fill ? "mt-4 shrink-0" : "mt-5",
        )}
      >
        <Wallet className="h-4 w-4" />
        Tüm Siparişleri Gör
        <ArrowRight className="h-4 w-4" />
      </Link>
    </DashboardCard>
  );
}