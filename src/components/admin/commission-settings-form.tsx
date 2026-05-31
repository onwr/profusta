"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";

export function CommissionSettingsForm() {
  const [rate, setRate] = useState("10");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/commission")
      .then((r) => r.json())
      .then((data) => {
        if (data.ratePercent != null) setRate(String(data.ratePercent));
      });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/settings/commission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ratePercent: Number(rate) }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) setMessage("Komisyon oranı güncellendi");
    else setMessage(data.error ?? "Hata");
  }

  return (
    <form onSubmit={onSubmit} className="max-w-md rounded-2xl border border-black/5 bg-white p-6">
      <label className="mb-1 block text-xs font-bold text-[#53635f]">
        Platform komisyon oranı (%)
      </label>
      <input
        type="number"
        min={0}
        max={100}
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        className={inputClassName}
      />
      {message ? (
        <p className="mt-3 text-sm text-[#087a61]">{message}</p>
      ) : null}
      <Button type="submit" disabled={loading} className="mt-4 h-10">
        Kaydet
      </Button>
    </form>
  );
}
