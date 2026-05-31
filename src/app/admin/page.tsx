import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  ClipboardList,
  Percent,
  Receipt,
  RotateCcw,
  ShoppingBag,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminCard } from "@/components/admin/admin-card";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

function formatCurrency(value: number) {
  return `${value.toLocaleString("tr-TR")} ₺`;
}

export default async function AdminDashboardPage() {
  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);

  const [
    users,
    providers,
    pendingApplications,
    requests,
    offers,
    orders,
    ordersLast30,
    paymentsSuccess,
    revenue,
    openDisputes,
    pendingRefunds,
    recentRequests,
    recentOrders,
  ] = await Promise.all([
    db.user.count(),
    db.provider.count({ where: { status: "APPROVED" } }),
    db.provider.count({ where: { status: "PENDING" } }),
    db.serviceRequest.count(),
    db.offer.count(),
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: last30 } } }),
    db.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
    db.order.aggregate({
      where: {
        status: { in: [OrderStatus.COMPLETED, OrderStatus.PAYOUT_COMPLETED] },
      },
      _sum: { amount: true, commissionAmount: true },
    }),
    db.dispute.count({ where: { status: "OPEN" } }),
    db.refund.count({ where: { status: "PENDING" } }),
    db.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { fullName: true } },
        category: { select: { name: true } },
      },
    }),
    db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: { select: { fullName: true } },
        provider: { include: { user: { select: { fullName: true } } } },
      },
    }),
  ]);

  const totalRevenue = revenue._sum.amount ?? 0;
  const totalCommission = revenue._sum.commissionAmount ?? 0;

  const alerts = [
    {
      label: "Bekleyen başvuru",
      value: pendingApplications,
      icon: ClipboardList,
      href: ROUTES.admin.applications,
      tone: "amber" as const,
    },
    {
      label: "Açık itiraz",
      value: openDisputes,
      icon: AlertCircle,
      href: ROUTES.admin.refundsDisputes,
      tone: "red" as const,
    },
    {
      label: "Bekleyen iade",
      value: pendingRefunds,
      icon: RotateCcw,
      href: ROUTES.admin.refundsDisputes,
      tone: "blue" as const,
    },
  ];

  const alertToneMap = {
    amber: "bg-[#fdf2dd] text-[#b7791f]",
    red: "bg-[#fdeaea] text-[#d4493f]",
    blue: "bg-[#e6efff] text-[#0b55ff]",
  };

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Genel Bakış"
        title="Dashboard"
        subtitle="Platformun anlık özeti ve dikkat gerektiren işlemler."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Toplam Kullanıcı"
          value={users.toLocaleString("tr-TR")}
          icon={Users}
          tone="blue"
        />
        <AdminStatCard
          label="Onaylı Usta"
          value={providers.toLocaleString("tr-TR")}
          icon={Wrench}
          tone="green"
        />
        <AdminStatCard
          label="Tamamlanan Ciro"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          tone="green"
          sub={`${ordersLast30.toLocaleString("tr-TR")} sipariş (son 30 gün)`}
        />
        <AdminStatCard
          label="Platform Komisyonu"
          value={formatCurrency(totalCommission)}
          icon={Percent}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Talep"
          value={requests.toLocaleString("tr-TR")}
          icon={ClipboardList}
          tone="slate"
          href={ROUTES.admin.requests}
        />
        <AdminStatCard
          label="Teklif"
          value={offers.toLocaleString("tr-TR")}
          icon={Receipt}
          tone="slate"
          href={ROUTES.admin.offers}
        />
        <AdminStatCard
          label="Sipariş"
          value={orders.toLocaleString("tr-TR")}
          icon={ShoppingBag}
          tone="slate"
          href={ROUTES.admin.orders}
        />
        <AdminStatCard
          label="Başarılı Ödeme"
          value={paymentsSuccess.toLocaleString("tr-TR")}
          icon={Receipt}
          tone="slate"
          href={ROUTES.admin.payments}
        />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-black text-[#083228]">
          Dikkat gerektirenler
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Link
                key={alert.label}
                href={alert.href}
                className="group flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]"
              >
                <div
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${alertToneMap[alert.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-2xl font-black text-[#083228]">
                    {alert.value}
                  </p>
                  <p className="text-xs font-semibold text-[#53635f]">
                    {alert.label}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#9aa8a4] transition group-hover:text-[#087a61]" />
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminCard
          title="Son talepler"
          actions={
            <Link
              href={ROUTES.admin.requests}
              className="text-xs font-bold text-[#087a61] hover:underline"
            >
              Tümü
            </Link>
          }
        >
          {recentRequests.length === 0 ? (
            <p className="text-sm text-[#53635f]">Henüz talep yok.</p>
          ) : (
            <ul className="space-y-3">
              {recentRequests.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#083228]">
                      {r.category.name}
                    </p>
                    <p className="truncate text-xs text-[#53635f]">
                      {r.customer.fullName} · {r.city}
                      {r.district ? ` / ${r.district}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-[#7b8b87]">
                    {new Date(r.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard
          title="Son siparişler"
          actions={
            <Link
              href={ROUTES.admin.orders}
              className="text-xs font-bold text-[#087a61] hover:underline"
            >
              Tümü
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#53635f]">Henüz sipariş yok.</p>
          ) : (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#083228]">
                      {o.title}
                    </p>
                    <p className="truncate text-xs text-[#53635f]">
                      {o.customer.fullName} → {o.provider.user.fullName}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-black text-[#087a61]">
                    {formatCurrency(o.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </div>
  );
}
