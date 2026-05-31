"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CouponAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [discountValue, setDiscountValue] = useState("10");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        discountType,
        discountValue: Number(discountValue),
      }),
    });
    setLoading(false);
    setCode("");
    router.refresh();
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-white p-4"
    >
      <label className="text-sm">
        Kod
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="mt-1 block rounded-lg border border-black/10 px-3 py-2"
          required
        />
      </label>
      <label className="text-sm">
        Tür
        <select
          value={discountType}
          onChange={(e) =>
            setDiscountType(e.target.value as "PERCENT" | "FIXED")
          }
          className="mt-1 block rounded-lg border border-black/10 px-3 py-2"
        >
          <option value="PERCENT">Yüzde</option>
          <option value="FIXED">Sabit ₺</option>
        </select>
      </label>
      <label className="text-sm">
        Değer
        <input
          type="number"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          className="mt-1 block w-24 rounded-lg border border-black/10 px-3 py-2"
          required
        />
      </label>
      <Button type="submit" disabled={loading} className="h-10">
        Ekle
      </Button>
    </form>
  );
}
