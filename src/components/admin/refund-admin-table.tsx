"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type RefundRow = {
  id: string;
  reason: string;
  amount: number | null;
  scenario: string;
  status: string;
  order: {
    title: string;
    amount: number;
    customer: { fullName: string };
    provider: { user: { fullName: string } };
  };
};

export function RefundAdminTable({ refunds }: { refunds: RefundRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject") {
    setLoadingId(id);
    const partial =
      action === "approve"
        ? prompt("İade tutarı (boş = tam tutar):", "")
        : null;
    await fetch(`/api/admin/refunds/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        refundAmount: partial ? Number(partial) : undefined,
      }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (refunds.length === 0) {
    return <p className="text-sm text-[#53635f]">Bekleyen iade yok.</p>;
  }

  return (
    <div className="space-y-4">
      {refunds.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
        >
          <p className="font-bold">{r.order.title}</p>
          <p className="text-sm text-[#53635f]">
            {r.order.customer.fullName} → {r.order.provider.user.fullName}
          </p>
          <p className="mt-2 text-sm">{r.reason}</p>
          <p className="mt-1 text-xs text-[#53635f]">
            Senaryo: {r.scenario} · Tutar:{" "}
            {(r.amount ?? r.order.amount).toLocaleString("tr-TR")} ₺
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              className="h-9 text-sm"
              disabled={loadingId === r.id}
              onClick={() => act(r.id, "approve")}
            >
              Onayla
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm"
              disabled={loadingId === r.id}
              onClick={() => act(r.id, "reject")}
            >
              Reddet
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
