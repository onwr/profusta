import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrdersPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const status = statusParam as OrderStatus | undefined;

  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { fullName: true } },
      provider: { include: { user: { select: { fullName: true } } } },
    },
  });

  const tabs = [
    { label: "Tümü", value: "" },
    { label: "Ödeme bekliyor", value: OrderStatus.PENDING_PAYMENT },
    { label: "Escrow", value: OrderStatus.PAID_ESCROW },
    { label: "Tamamlandı", value: OrderStatus.COMPLETED },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="Siparişler"
        subtitle="Tüm siparişleri durumlarına göre izleyin"
      />
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value || "all"}
            href={
              tab.value
                ? `${ROUTES.admin.orders}?status=${tab.value}`
                : ROUTES.admin.orders
            }
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold",
              (status ?? "") === tab.value
                ? "bg-[#087a61] text-white"
                : "bg-white text-[#083228] hover:bg-[#eef8f5]",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <article
            key={o.id}
            className="rounded-2xl border border-black/5 bg-white p-6"
          >
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <h2 className="font-bold">{o.title}</h2>
                <p className="text-sm text-[#53635f]">
                  {o.customer.fullName} → {o.provider.user.fullName}
                </p>
                <p className="mt-1 font-bold text-[#087a61]">
                  {o.amount.toLocaleString("tr-TR")} ₺
                </p>
              </div>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="mt-2 text-xs text-[#53635f]">{o.merchantOid}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
