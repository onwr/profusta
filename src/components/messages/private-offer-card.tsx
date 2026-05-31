"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Shield,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PrivateOfferData = {
  id: string;
  title?: string;
  price: number;
  description: string;
  scheduledAt: string | null;
  durationHours: number | null;
  warrantyNote: string | null;
  status: string;
};

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Onay bekliyor",
    className: "bg-amber-100 text-amber-800",
  },
  ACCEPTED: {
    label: "Kabul edildi",
    className: "bg-[#087a61]/15 text-[#087a61]",
  },
  REJECTED: {
    label: "Reddedildi",
    className: "bg-red-100 text-red-800",
  },
};

export function PrivateOfferCard({
  offer,
  isCustomer,
  conversationId,
  onUpdate,
}: {
  offer: PrivateOfferData;
  isCustomer: boolean;
  conversationId: string;
  onUpdate?: () => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const status = statusConfig[offer.status] ?? {
    label: offer.status,
    className: "bg-[#eef8f5] text-[#53635f]",
  };

  async function handleAction(action: "accept" | "reject") {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/private-offers/${offer.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "İşlem başarısız");
        return;
      }
      if (action === "accept" && data.paymentUrl) {
        router.push(data.paymentUrl);
        return;
      }
      onUpdate?.();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#087a61]/25 bg-white shadow-sm ring-1 ring-[#087a61]/10">
      <div className="bg-gradient-to-r from-[#087a61] to-[#06644f] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wide text-white/90">
          Özel teklif
        </p>
        {offer.title ? (
          <p className="mt-1 text-sm font-semibold text-white/95 line-clamp-2">
            {offer.title}
          </p>
        ) : null}
        <p className="mt-1 text-2xl font-black text-white">
          {offer.price.toLocaleString("tr-TR")} ₺
        </p>
      </div>

      <div className="space-y-3 p-4">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-1 text-xs font-bold",
            status.className,
          )}
        >
          {status.label}
        </span>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#083228]">
          {offer.description}
        </p>

        <div className="space-y-2 text-xs text-[#53635f]">
          {offer.scheduledAt ? (
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-[#087a61]" />
              {new Date(offer.scheduledAt).toLocaleString("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}
          {offer.durationHours ? (
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#087a61]" />
              Tahmini süre: {offer.durationHours} saat
            </p>
          ) : null}
          {offer.warrantyNote ? (
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#087a61]" />
              {offer.warrantyNote}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}

        {isCustomer && offer.status === "PENDING" ? (
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              className="h-10 flex-1 gap-1 text-sm"
              disabled={loading}
              onClick={() => handleAction("accept")}
            >
              <Check className="h-4 w-4" />
              Kabul et ve öde
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 text-sm"
              disabled={loading}
              onClick={() => handleAction("reject")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
