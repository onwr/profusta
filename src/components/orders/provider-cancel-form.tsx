"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";

export function ProviderCancelForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("İşi iptal etmek istediğinize emin misiniz? Müşteriye tam iade yapılır.")) {
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}/cancel-by-provider`, {
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
      className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6"
    >
      <h2 className="font-bold text-[#083228]">İşi iptal et (usta)</h2>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <textarea
        required
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className={`${inputClassName} mt-3`}
        rows={3}
        minLength={10}
      />
      <Button
        type="submit"
        variant="outline"
        disabled={loading}
        className="mt-3 h-10 text-red-700"
      >
        {loading ? "İşleniyor..." : "İptali onayla"}
      </Button>
    </form>
  );
}
