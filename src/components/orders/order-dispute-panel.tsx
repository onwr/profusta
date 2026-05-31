"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";
import {
  disputeEventLabels,
  disputePhaseLabels,
} from "@/lib/orders/dispute-labels";
import { cn } from "@/lib/utils";

export type SerializedDispute = {
  id: string;
  description: string;
  status: string;
  phase: string;
  createdAt: string;
  events: {
    id: string;
    type: string;
    message: string;
    actorRole: string;
    createdAt: string;
  }[];
};

const actorLabels: Record<string, string> = {
  CUSTOMER: "Müşteri",
  PROVIDER: "Usta",
  ADMIN: "Admin",
};

export function OrderDisputePanel({
  orderId,
  orderStatus,
  disputes,
  isCustomer,
  isProvider,
}: {
  orderId: string;
  orderStatus: string;
  disputes: SerializedDispute[];
  isCustomer: boolean;
  isProvider: boolean;
}) {
  if (disputes.length === 0 && orderStatus !== "DISPUTED") {
    return null;
  }

  const openDispute =
    disputes.find((d) => d.status === "OPEN") ?? disputes[0];

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-lg font-black text-[#083228]">İtiraz geçmişi</h2>

      {disputes.map((dispute) => (
        <div
          key={dispute.id}
          className="rounded-2xl border border-orange-200 bg-orange-50/50 p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#083228]">
              {new Date(dispute.createdAt).toLocaleString("tr-TR")}
            </p>
            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-orange-800">
              {dispute.status === "OPEN"
                ? disputePhaseLabels[dispute.phase] ?? dispute.phase
                : dispute.status}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-xs font-bold uppercase text-[#53635f]">
              İtiraz gerekçesi
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-[#083228]">
              {dispute.description}
            </p>
          </div>

          <ol className="mt-4 space-y-3 border-l-2 border-orange-200 pl-4">
            {dispute.events.map((ev) => (
              <li key={ev.id} className="relative">
                <p className="text-xs font-bold text-[#087a61]">
                  {disputeEventLabels[ev.type] ?? ev.type}
                  <span className="ml-2 font-normal text-[#7b8b87]">
                    {actorLabels[ev.actorRole] ?? ev.actorRole} ·{" "}
                    {new Date(ev.createdAt).toLocaleString("tr-TR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-[#53635f]">
                  {ev.message}
                </p>
              </li>
            ))}
          </ol>

          {dispute.status === "OPEN" &&
          isProvider &&
          dispute.phase === "AWAITING_PROVIDER" ? (
            <ProviderDisputeActions
              orderId={orderId}
              disputeId={dispute.id}
            />
          ) : null}

          {dispute.status === "OPEN" &&
          isCustomer &&
          dispute.phase === "AWAITING_PROVIDER" ? (
            <p className="mt-4 text-sm text-[#53635f]">
              Ustanın düzeltme veya yanıt vermesi bekleniyor.
            </p>
          ) : null}

          {dispute.status === "OPEN" &&
          isCustomer &&
          dispute.phase === "AWAITING_CUSTOMER" ? (
            <p className="mt-4 rounded-xl bg-[#eef8f5] px-4 py-3 text-sm text-[#087a61]">
              Usta düzeltmeyi gönderdi. Yukarıdaki &quot;İşi onayla&quot; ile
              onaylayabilirsiniz.
            </p>
          ) : null}
        </div>
      ))}

      {orderStatus === "DISPUTED" && !openDispute ? (
        <p className="text-sm text-[#53635f]">İtiraz kaydı yükleniyor…</p>
      ) : null}
    </div>
  );
}

function ProviderDisputeActions({
  orderId,
  disputeId,
}: {
  orderId: string;
  disputeId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [fixSummary, setFixSummary] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<"message" | "resubmit" | null>(null);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setLoading("message");
    setError("");
    const res = await fetch(
      `/api/orders/${orderId}/disputes/${disputeId}/provider-message`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      },
    );
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Mesaj gönderilemedi");
      return;
    }
    setMessage("");
    router.refresh();
  }

  async function resubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading("resubmit");
    setError("");
    const res = await fetch(
      `/api/orders/${orderId}/disputes/${disputeId}/resubmit`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: fixSummary }),
      },
    );
    const data = await res.json();
    setLoading(null);
    if (!res.ok) {
      setError(data.error ?? "Düzeltme gönderilemedi");
      return;
    }
    setFixSummary("");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4 border-t border-orange-200 pt-4">
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}

      <form onSubmit={sendMessage}>
        <p className="text-sm font-bold text-[#083228]">Kısa mesaj (opsiyonel)</p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(inputClassName, "mt-2 min-h-[80px]")}
          rows={3}
          minLength={10}
          placeholder="Müşteriye bilgi notu..."
        />
        <Button
          type="submit"
          variant="outline"
          disabled={loading !== null || message.trim().length < 10}
          className="mt-2 h-10"
        >
          {loading === "message" ? "..." : "Mesaj gönder"}
        </Button>
      </form>

      <form onSubmit={resubmit}>
        <p className="text-sm font-bold text-[#083228]">
          Düzeltmeyi gönder ve onaya sun
        </p>
        <textarea
          required
          value={fixSummary}
          onChange={(e) => setFixSummary(e.target.value)}
          className={cn(inputClassName, "mt-2 min-h-[100px]")}
          rows={4}
          minLength={20}
          placeholder="Yapılan düzeltmeleri özetleyin..."
        />
        <Button
          type="submit"
          disabled={loading !== null || fixSummary.trim().length < 20}
          className="mt-2 h-10"
        >
          {loading === "resubmit" ? "..." : "Düzeltmeyi müşteri onayına gönder"}
        </Button>
      </form>
    </div>
  );
}
