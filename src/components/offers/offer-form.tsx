"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { inputClassName } from "@/components/auth/form-field";
import { Button } from "@/components/ui/button";

type ProviderOffer = {
  id: string;
  price: number;
  description: string;
  estimatedDuration: string | null;
  proposedDate: string | null;
  status: string;
};

export function OfferForm({
  requestId,
  existingOffer,
  onOfferSent,
}: {
  requestId: string;
  existingOffer?: ProviderOffer | null;
  onOfferSent?: (offer: ProviderOffer) => void;
}) {
  const router = useRouter();
  const [offer, setOffer] = useState<ProviderOffer | null>(existingOffer ?? null);
  const [price, setPrice] = useState(offer?.price?.toString() ?? "");
  const [description, setDescription] = useState(offer?.description ?? "");
  const [estimatedDuration, setEstimatedDuration] = useState(offer?.estimatedDuration ?? "");
  const [proposedDate, setProposedDate] = useState(
    offer?.proposedDate ? new Date(offer.proposedDate).toISOString().slice(0, 10) : "",
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const hasPendingOffer = offer?.status === "PENDING";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/provider/requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(price),
          description,
          estimatedDuration: estimatedDuration || undefined,
          proposedDate: proposedDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Teklif gönderilemedi");
        return;
      }
      setOffer(data.offer);
      onOfferSent?.(data.offer);
      setSuccess("Teklifiniz müşteriye gönderildi.");
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function withdraw() {
    if (!offer || !confirm("Teklifi geri çekmek istiyor musunuz?")) return;
    setLoading(true);
    await fetch(`/api/provider/offers/${offer.id}/withdraw`, {
      method: "PATCH",
    });
    setOffer(null);
    setSuccess("");
    router.refresh();
    setLoading(false);
  }

  if (hasPendingOffer) {
    return (
      <div className="rounded-2xl border border-[#087a61]/25 bg-[#eef8f5] p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
          <h3 className="font-bold text-[#083228]">Teklifiniz gönderildi</h3>
        </div>
        {success ? (
          <p className="mt-3 rounded-xl bg-[#dcf7e7] px-4 py-3 text-sm font-bold text-[#10b981]">
            {success}
          </p>
        ) : null}
        <p className="mt-2 text-2xl font-black text-[#087a61]">
          ₺{offer.price.toLocaleString("tr-TR")}
        </p>
        <p className="mt-2 text-sm text-[#5a7a72]">{offer.description}</p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 h-10"
          disabled={loading}
          onClick={withdraw}
        >
          Teklifi Geri Çek
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
    >
      <h3 className="text-[15px] font-black text-[#083228]">Teklif Ver</h3>
      <p className="text-xs text-[#5a7a72]">
        Müşteriye fiyat ve süre önerinizle teklif gönderin.
      </p>
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-xl bg-[#dcf7e7] px-4 py-3 text-sm font-bold text-[#10b981]">
          {success}
        </p>
      ) : null}
      <div>
        <label className="mb-1 block text-sm font-bold text-[#083228]">
          Fiyat (₺)
        </label>
        <input
          type="number"
          min={1}
          step={1}
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClassName}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-[#083228]">Açıklama</label>
        <textarea
          required
          minLength={10}
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClassName}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-[#083228]">
          Tahmini süre
        </label>
        <input
          value={estimatedDuration}
          onChange={(e) => setEstimatedDuration(e.target.value)}
          placeholder="Örn. 2 saat"
          className={inputClassName}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-bold text-[#083228]">
          Önerilen tarih
        </label>
        <input
          type="date"
          value={proposedDate}
          onChange={(e) => setProposedDate(e.target.value)}
          className={inputClassName}
        />
      </div>
      <Button type="submit" disabled={loading} className="h-11">
        {loading ? "Gönderiliyor..." : "Teklifi Gönder"}
      </Button>
    </form>
  );
}
