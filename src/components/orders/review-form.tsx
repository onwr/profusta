"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { panelClasses } from "@/components/panel/panel-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ReviewForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: Number(rating), comment }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Gönderilemedi");
      return;
    }
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-8 rounded-2xl border border-black/5 bg-white p-6"
    >
      <h2 className="font-bold text-[#083228]">Hizmeti değerlendirin</h2>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Puan (1-5)
        </label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className={panelClasses.input}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} yıldız
            </option>
          ))}
        </select>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Yorumunuz
        </label>
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className={panelClasses.input}
          rows={4}
          minLength={10}
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className={cn(panelClasses.primaryBtn, "mt-4 h-10")}
      >
        {loading ? "Gönderiliyor..." : "Yorumu gönder"}
      </Button>
    </form>
  );
}
