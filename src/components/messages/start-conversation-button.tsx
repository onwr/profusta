"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function StartConversationButton({
  providerId,
  listingId,
  className,
}: {
  providerId: string;
  listingId?: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, listingId }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/giris?redirect=${encodeURIComponent(window.location.pathname)}`);
        return;
      }
      if (res.status === 403) {
        setError("Bu işlem için müşteri hesabı gerekli");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Konuşma başlatılamadı");
        return;
      }
      router.push(`${ROUTES.customer.messages}/${data.conversation.id}`);
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
        className={className ?? "h-11"}
        disabled={loading}
        onClick={start}
      >
        {loading ? "Açılıyor..." : "Mesaj at"}
      </Button>
      {error ? (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
