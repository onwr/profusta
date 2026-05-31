"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type DisputeRow = {
  id: string;
  description: string;
  order: {
    title: string;
    amount: number;
    customer: { fullName: string };
    provider: { user: { fullName: string } };
  };
  customer: { fullName: string };
};

export function DisputeAdminTable({ disputes }: { disputes: DisputeRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function act(
    id: string,
    action: "full_refund" | "partial_refund" | "release_to_provider" | "reject",
  ) {
    setLoadingId(id);
    let refundAmount: number | undefined;
    if (action === "partial_refund") {
      const v = prompt("Kısmi iade tutarı (₺):");
      if (!v) {
        setLoadingId(null);
        return;
      }
      refundAmount = Number(v);
    }
    await fetch(`/api/admin/disputes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, refundAmount }),
    });
    setLoadingId(null);
    router.refresh();
  }

  if (disputes.length === 0) {
    return <p className="text-sm text-[#53635f]">Açık itiraz yok.</p>;
  }

  return (
    <div className="space-y-4">
      {disputes.map((d) => (
        <article
          key={d.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
        >
          <p className="font-bold">{d.order.title}</p>
          <p className="text-sm text-[#53635f]">
            {d.customer.fullName} · {d.order.provider.user.fullName}
          </p>
          <p className="mt-2 text-sm">{d.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              className="h-9 text-sm"
              disabled={loadingId === d.id}
              onClick={() => act(d.id, "full_refund")}
            >
              Tam iade
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm"
              disabled={loadingId === d.id}
              onClick={() => act(d.id, "partial_refund")}
            >
              Kısmi iade
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm"
              disabled={loadingId === d.id}
              onClick={() => act(d.id, "release_to_provider")}
            >
              Ustaya aktar
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-sm text-red-600"
              disabled={loadingId === d.id}
              onClick={() => act(d.id, "reject")}
            >
              Reddet
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
