"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function OrderActions({
  orderId,
  status,
  isCustomer,
  isProvider,
}: {
  orderId: string;
  status: string;
  isCustomer: boolean;
  isProvider: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function callAction(path: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/${path}`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {isCustomer && status === "PENDING_PAYMENT" ? (
        <Button
          type="button"
          className="h-10"
          onClick={() => router.push(ROUTES.payment(orderId))}
        >
          Ödemeye git
        </Button>
      ) : null}
      {isProvider && status === "PAID_ESCROW" ? (
        <Button
          type="button"
          className="h-10"
          disabled={loading}
          onClick={() => callAction("accept")}
        >
          İşi kabul et
        </Button>
      ) : null}
      {isProvider && status === "PROVIDER_ACCEPTED" ? (
        <Button
          type="button"
          className="h-10"
          disabled={loading}
          onClick={() => callAction("start")}
        >
          İşe başla
        </Button>
      ) : null}
      {isProvider && status === "IN_PROGRESS" ? (
        <Button
          type="button"
          className="h-10"
          disabled={loading}
          onClick={() => callAction("complete")}
        >
          İşi tamamladım
        </Button>
      ) : null}
      {isCustomer && status === "COMPLETED_BY_PROVIDER" ? (
        <Button
          type="button"
          className="h-10"
          disabled={loading}
          onClick={() => callAction("confirm")}
        >
          İşi onayla
        </Button>
      ) : null}
    </div>
  );
}
