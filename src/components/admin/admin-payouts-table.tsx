"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type PayoutRow = {
  id: string;
  amount: number;
  iban: string;
  status: string;
  provider: { user: { fullName: string } };
};

export function AdminPayoutsTable({ payouts }: { payouts: PayoutRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function act(id: string, action: "approve" | "reject" | "mark_paid") {
    setLoadingId(id);
    await fetch(`/api/admin/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (payouts.length === 0) {
    return <p className="text-sm text-[#53635f]">Ödeme talebi yok.</p>;
  }

  return (
    <div className="space-y-4">
      {payouts.map((p) => (
        <article
          key={p.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
        >
          <p className="font-bold">{p.provider.user.fullName}</p>
          <p className="text-lg font-black text-[#087a61]">
            {p.amount.toLocaleString("tr-TR")} ₺
          </p>
          <p className="text-xs text-[#53635f]">{p.iban}</p>
          <p className="mt-1 text-xs font-semibold">{p.status}</p>
          {p.status === "PENDING" ? (
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                className="h-9 text-sm"
                disabled={loadingId === p.id}
                onClick={() => act(p.id, "approve")}
              >
                Onayla
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-sm"
                disabled={loadingId === p.id}
                onClick={() => act(p.id, "reject")}
              >
                Reddet
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 text-sm"
                disabled={loadingId === p.id}
                onClick={() => act(p.id, "mark_paid")}
              >
                Ödendi işaretle
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
