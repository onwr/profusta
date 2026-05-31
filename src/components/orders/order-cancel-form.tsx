"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { panelClasses } from "@/components/panel/panel-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function OrderCancelForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "İptal başarısız");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6"
    >
      <h2 className="font-bold text-[#083228]">Siparişi iptal et</h2>
      <p className="mt-1 text-xs text-[#53635f]">
        Usta henüz kabul etmediyse tam iade uygulanır.
      </p>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <textarea
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className={cn(panelClasses.input, "mt-3")}
        rows={3}
        minLength={10}
        placeholder="İptal sebebiniz..."
      />
      <Button
        type="submit"
        variant="outline"
        disabled={loading}
        className="mt-3 h-10 border-red-300 text-red-700"
      >
        {loading ? "İşleniyor..." : "İptal talebi gönder"}
      </Button>
    </form>
  );
}
