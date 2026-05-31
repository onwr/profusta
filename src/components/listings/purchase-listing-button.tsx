"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PurchaseListingButton({
  listingId,
  className,
}: {
  listingId: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function purchase() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: "LISTING",
          sourceId: listingId,
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/giris?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.status === 403) {
        setError("Satın alma için müşteri hesabı gerekli");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Sipariş oluşturulamadı");
        return;
      }
      router.push(data.paymentUrl);
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className={className ?? "h-11"}
        disabled={loading}
        onClick={purchase}
      >
        {loading ? "Hazırlanıyor..." : "Satın al"}
      </Button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
