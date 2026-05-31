import { getServiceDensityReport } from "@/lib/admin/density-report";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminTableShell } from "@/components/admin/admin-card";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const [
    users,
    providers,
    requests,
    offers,
    orders,
    paymentsSuccess,
    revenue,
    openDisputes,
    pendingRefunds,
  ] = await Promise.all([
    db.user.count(),
    db.provider.count({ where: { status: "APPROVED" } }),
    db.serviceRequest.count(),
    db.offer.count(),
    db.order.count(),
    db.payment.count({ where: { status: PaymentStatus.SUCCESS } }),
    db.order.aggregate({
      where: {
        status: { in: [OrderStatus.COMPLETED, OrderStatus.PAYOUT_COMPLETED] },
      },
      _sum: { amount: true, commissionAmount: true },
    }),
    db.dispute.count({ where: { status: "OPEN" } }),
    db.refund.count({ where: { status: "PENDING" } }),
  ]);

  const last30 = new Date();
  last30.setDate(last30.getDate() - 30);
  const [ordersLast30, density] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: last30 } },
    }),
    getServiceDensityReport(),
  ]);

  const maxDensity = density[0]?.total ?? 1;

  const cards = [
    { label: "Kullanıcı", value: users },
    { label: "Onaylı usta", value: providers },
    { label: "Talep", value: requests },
    { label: "Teklif", value: offers },
    { label: "Sipariş", value: orders },
    { label: "Son 30 gün sipariş", value: ordersLast30 },
    { label: "Başarılı ödeme", value: paymentsSuccess },
    {
      label: "Tamamlanan ciro",
      value: `${(revenue._sum.amount ?? 0).toLocaleString("tr-TR")} ₺`,
    },
    {
      label: "Platform komisyonu",
      value: `${(revenue._sum.commissionAmount ?? 0).toLocaleString("tr-TR")} ₺`,
    },
    { label: "Açık itiraz", value: openDisputes },
    { label: "Bekleyen iade", value: pendingRefunds },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Genel Bakış"
        title="Raporlar"
        subtitle="Özet platform metrikleri"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.label}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
          >
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#7b8b87]">
              {c.label}
            </p>
            <p className="mt-2 text-2xl font-black text-[#087a61]">{c.value}</p>
          </article>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#083228]">
          Hizmet yoğunluğu (il / ilçe)
        </h2>
        <p className="mt-1 text-sm text-[#53635f]">
          Talep ve aktif ilan sayılarına göre top 30 bölge
        </p>
        <AdminTableShell className="mt-6">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-[#f7f7f3]">
              <tr>
                <th className="px-4 py-3 font-bold">İl</th>
                <th className="px-4 py-3 font-bold">İlçe</th>
                <th className="px-4 py-3 font-bold">Talep</th>
                <th className="px-4 py-3 font-bold">İlan</th>
                <th className="px-4 py-3 font-bold">Yoğunluk</th>
              </tr>
            </thead>
            <tbody>
              {density.map((row) => (
                <tr key={`${row.city}-${row.district}`} className="border-b border-black/5">
                  <td className="px-4 py-3">{row.city}</td>
                  <td className="px-4 py-3">{row.district}</td>
                  <td className="px-4 py-3">{row.requestCount}</td>
                  <td className="px-4 py-3">{row.listingCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 rounded-full bg-[#087a61]"
                        style={{
                          width: `${Math.max(8, (row.total / maxDensity) * 120)}px`,
                        }}
                      />
                      <span className="text-xs text-[#53635f]">{row.total}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTableShell>
      </section>
    </div>
  );
}
