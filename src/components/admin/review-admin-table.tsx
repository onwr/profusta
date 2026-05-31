"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ReviewRow = {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  customer: { fullName: string };
  provider: { user: { fullName: string } };
  order: { title: string };
};

export function ReviewAdminTable({ reviews }: { reviews: ReviewRow[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function toggle(id: string, isVisible: boolean) {
    setLoadingId(id);
    await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
        >
          <p className="font-bold">
            {r.rating}/5 — {r.order.title}
          </p>
          <p className="text-sm text-[#53635f]">
            {r.customer.fullName} → {r.provider.user.fullName}
          </p>
          <p className="mt-2 text-sm">{r.comment}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-3 h-9 text-sm"
            disabled={loadingId === r.id}
            onClick={() => toggle(r.id, r.isVisible)}
          >
            {r.isVisible ? "Gizle" : "Yayınla"}
          </Button>
        </article>
      ))}
    </div>
  );
}
