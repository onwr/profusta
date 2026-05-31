"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";

export function OrderDisputeForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}/disputes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "İtiraz açılamadı");
      return;
    }
    setDescription("");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-6"
    >
      <h2 className="font-bold text-[#083228]">İtiraz aç</h2>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <textarea
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className={`${inputClassName} mt-3`}
        rows={4}
        minLength={20}
        placeholder="Sorunu detaylı açıklayın..."
      />
      <Button type="submit" disabled={loading} className="mt-3 h-10">
        {loading ? "Gönderiliyor..." : "İtiraz gönder"}
      </Button>
      <p className="mt-2 text-xs text-[#7b8b87]">
        Gönderimden sonra itiraz geçmişi bu sayfada görünecektir.
      </p>
    </form>
  );
}
