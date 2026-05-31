"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Calendar,
  CreditCard,
  Loader2,
  PackageCheck,
  Plus,
  Sparkles,
  UserRound,
} from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ROUTES } from "@/lib/constants";

type OrderRow = {
  id: string;
  title: string;
  amount: number;
  status: string;
  providerName?: string;
  createdAt: string;
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.orders ?? []);
        setLoading(false);
      });
  }, []);

  const totalAmount = orders.reduce((sum, order) => sum + order.amount, 0);
  const activeCount = orders.filter(
    (order) => !["COMPLETED", "CANCELLED", "REFUNDED"].includes(order.status)
  ).length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
              <PackageCheck className="h-4 w-4" />
              Sipariş Yönetimi
            </div>

            <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
              Siparişlerim
            </h1>

            <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53635f]">
              Ödeme yaptığınız hizmetleri, aktif siparişlerinizi ve geçmiş
              işlemlerinizi buradan takip edin.
            </p>
          </div>

          <Link
            href={ROUTES.createRequest}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-7 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
          >
            <Plus className="h-4 w-4" />
            Yeni Talep Oluştur
          </Link>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<PackageCheck className="h-5 w-5" />}
            label="Toplam Sipariş"
            value={loading ? "..." : orders.length}
          />
          <StatCard
            icon={<Sparkles className="h-5 w-5" />}
            label="Aktif Sipariş"
            value={loading ? "..." : activeCount}
          />
          <StatCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Toplam Ödeme"
            value={loading ? "..." : `${totalAmount.toLocaleString("tr-TR")} ₺`}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-[#083228]">
              Sipariş Listesi
            </h2>
            <p className="mt-1 text-sm text-[#53635f]">
              Hizmet siparişlerinizi detaylı inceleyin.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] bg-[#FBFDF5]">
            <div className="flex flex-col items-center gap-3 text-sm font-medium text-[#53635f]">
              <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
              Siparişler yükleniyor...
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-[#087a61]">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-black text-[#083228]">
              Henüz siparişiniz yok
            </h3>

            <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-[#53635f]">
              Bir hizmet talebi oluşturup teklif kabul ettiğinizde siparişiniz
              burada görünecek.
            </p>

            <Link
              href={ROUTES.createRequest}
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-6 text-sm font-black text-white"
            >
              <Plus className="h-4 w-4" />
              Talep Oluştur
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`${ROUTES.customer.orders}/${order.id}`}
                className="group rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_16px_38px_rgba(8,50,40,0.07)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex min-w-0 gap-4">
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white text-[#087a61] shadow-sm">
                      <PackageCheck className="h-7 w-7" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black text-[#083228]">
                          {order.title}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      {order.providerName ? (
                        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[#53635f]">
                          <UserRound className="h-4 w-4 text-[#087a61]" />
                          {order.providerName}
                        </p>
                      ) : null}

                      <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#53635f]">
                        <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
                        {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-3xl font-black text-[#087a61]">
                      {order.amount.toLocaleString("tr-TR")} ₺
                    </p>

                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[#083228] transition group-hover:text-[#087a61]">
                      Siparişi İncele
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-black text-[#083228]">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-[#53635f]">{label}</p>
        </div>
      </div>
    </div>
  );
}