"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ROUTES } from "@/lib/constants";

type OrderRow = {
  id: string;
  title: string;
  status: string;
  latestDispute?: {
    description: string;
    status: string;
    phase: string;
  } | null;
};

const phaseLabels: Record<string, string> = {
  AWAITING_PROVIDER: "Usta yanıtı bekleniyor",
  AWAITING_CUSTOMER: "Onayınız bekleniyor",
  CLOSED: "Kapalı",
};

export default function CustomerRefundsDisputesPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.orders ?? []).filter(
          (o: { status: string }) =>
            o.status === "REFUNDED" ||
            o.status === "CANCELLED" ||
            o.status === "DISPUTED",
        );
        setOrders(list);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-black text-[#083228]">İade ve İtiraz</h1>
      <p className="mt-1 text-sm text-[#53635f]">
        İptal veya itiraz sürecindeki siparişleriniz
      </p>
      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-[#53635f]">Kayıt yok.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`${ROUTES.customer.orders}/${o.id}`}
              className="block rounded-xl border border-black/5 bg-white p-4 hover:border-[#087a61]/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold">{o.title}</p>
                <OrderStatusBadge status={o.status} />
              </div>
              {o.latestDispute ? (
                <p className="mt-2 line-clamp-2 text-sm text-[#53635f]">
                  <span className="font-semibold text-orange-800">
                    İtiraz:{" "}
                  </span>
                  {o.latestDispute.description}
                </p>
              ) : null}
              {o.latestDispute?.status === "OPEN" ? (
                <p className="mt-1 text-xs text-[#087a61]">
                  {phaseLabels[o.latestDispute.phase] ??
                    o.latestDispute.phase}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
