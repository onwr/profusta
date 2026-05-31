"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProviderProToggle({
  providerId,
  initialIsPro,
}: {
  providerId: string;
  initialIsPro: boolean;
}) {
  const router = useRouter();
  const [isPro, setIsPro] = useState(initialIsPro);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    const next = !isPro;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/providers/${providerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setPro", isPro: next }),
      });

      if (res.ok) {
        setIsPro(next);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={`rounded-xl px-3 py-2 text-xs font-black transition disabled:opacity-60 ${
        isPro
          ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "bg-[#eef8f5] text-[#087a61] hover:bg-[#dff2ed]"
      }`}
    >
      {loading ? "Güncelleniyor..." : isPro ? "PRO kaldır" : "PRO ver"}
    </button>
  );
}
