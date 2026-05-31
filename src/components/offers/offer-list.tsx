"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  MapPin,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { formatDistanceKm } from "@/lib/geo/haversine";
import { cn } from "@/lib/utils";

type OfferItem = {
  id: string;
  price: number;
  description: string;
  estimatedDuration: string | null;
  proposedDate: string | null;
  status: string;
  distanceKm?: number;
  provider: {
    id: string;
    slug: string | null;
    fullName: string;
    avatarUrl: string | null;
    bio: string | null;
    ratingAvg: number | null;
    reviewCount: number;
  };
};

export function OfferList({
  requestId,
  requestStatus,
}: {
  requestId: string;
  requestStatus: string;
}) {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferItem[]>([]);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sort, setSort] = useState<"distance" | "price">("distance");

  const loadOffers = useCallback((sortMode: "distance" | "price") => {
    setLoading(true);
    fetch(`/api/requests/${requestId}/offers?sort=${sortMode}`)
      .then((r) => r.json())
      .then((data) => {
        setOffers(data.offers ?? []);
        setAcceptedOfferId(data.acceptedOfferId ?? null);
        setLoading(false);
      });
  }, [requestId]);

  useEffect(() => {
    queueMicrotask(() => loadOffers(sort));
  }, [loadOffers, sort]);

  async function goToPayment(offerId: string) {
    setActionId(offerId);
    setError("");
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceType: "REQUEST_OFFER",
        sourceId: offerId,
      }),
    });
    const data = await res.json();
    setActionId(null);
    if (!res.ok) {
      setError(data.error ?? "Sipariş oluşturulamadı");
      return;
    }
    if (data.paymentUrl) router.push(data.paymentUrl);
  }

  async function accept(offerId: string) {
    if (!confirm("Bu teklifi kabul etmek istiyor musunuz?")) return;
    setActionId(offerId);
    setError("");
    const res = await fetch(
      `/api/requests/${requestId}/offers/${offerId}/accept`,
      { method: "PATCH" },
    );
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "İşlem başarısız");
      setActionId(null);
      return;
    }
    setSuccess(data.message ?? "Teklif kabul edildi");
    if (data.paymentUrl) {
      router.push(data.paymentUrl);
      return;
    }
    router.refresh();
    const refreshed = await fetch(
      `/api/requests/${requestId}/offers?sort=${sort}`,
    );
    const refreshedData = await refreshed.json();
    setOffers(refreshedData.offers ?? []);
    setAcceptedOfferId(refreshedData.acceptedOfferId ?? null);
    setActionId(null);
  }

  const canAccept = requestStatus === "OPEN";
  const recommendedOfferId = useMemo(() => {
    if (offers.length === 0) return null;

    const prices = offers.map((offer) => offer.price);
    const distances = offers
      .map((offer) => offer.distanceKm)
      .filter((distance): distance is number => distance != null);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const minDistance = distances.length > 0 ? Math.min(...distances) : 0;
    const maxDistance = distances.length > 0 ? Math.max(...distances) : 0;

    function normalize(value: number, min: number, max: number) {
      if (max === min) return 0;
      return (value - min) / (max - min);
    }

    const scored = offers.map((offer) => {
      const priceScore = normalize(offer.price, minPrice, maxPrice);
      const distanceScore =
        offer.distanceKm != null
          ? normalize(offer.distanceKm, minDistance, maxDistance)
          : 1;
      const ratingScore =
        offer.provider.ratingAvg != null
          ? (5 - offer.provider.ratingAvg) / 5
          : 0.6;
      const reviewScore =
        offer.provider.reviewCount > 0
          ? 1 - Math.min(offer.provider.reviewCount, 100) / 100
          : 0.7;

      return {
        id: offer.id,
        score:
          priceScore * 0.35 +
          distanceScore * 0.3 +
          ratingScore * 0.25 +
          reviewScore * 0.1,
      };
    });

    scored.sort((a, b) => a.score - b.score);
    return scored[0]?.id ?? null;
  }, [offers]);

  if (loading) {
    return <p className="text-sm text-[#64748b]">Teklifler yükleniyor...</p>;
  }

  return (
    <div className="space-y-3">
      {offers.length > 0 ? (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setSort("distance")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold transition",
              sort === "distance"
                ? "bg-[#087a61] text-white"
                : "border border-[#e5eaf1] bg-white text-[#64748b]",
            )}
          >
            Mesafeye göre
          </button>
          <button
            type="button"
            onClick={() => setSort("price")}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-bold transition",
              sort === "price"
                ? "bg-[#087a61] text-white"
                : "border border-[#e5eaf1] bg-white text-[#64748b]",
            )}
          >
            Fiyata göre
          </button>
        </div>
      ) : null}
      {success ? (
        <p className="rounded-xl bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#087a61]">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {offers.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/10 bg-white p-6 text-center text-sm text-[#64748b]">
          Henüz teklif gelmedi. Ustalar bilgilendirildi.
        </p>
      ) : (
        offers.map((offer) => {
          const recommended = offer.id === recommendedOfferId;
          return (
          <article
            key={offer.id}
            className={[
              "rounded-xl border bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
              recommended && offer.status === "PENDING"
                ? "border-[#087a61]/25 bg-[#FBFDF5]"
                : offer.status === "ACCEPTED"
                  ? "border-[#087a61]"
                  : "border-[#e5eaf1]",
            ].join(" ")}
          >
            <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_160px]">
              <div className="flex min-w-0 gap-3">
                <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#eef8f5] text-lg font-black text-[#083228]">
                  {offer.provider.avatarUrl ? (
                    <Image
                      src={offer.provider.avatarUrl}
                      alt={offer.provider.fullName}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                  ) : (
                    offer.provider.fullName.charAt(0)
                  )}
                </div>
                <div className="min-w-0">
                <Link
                  href={`${ROUTES.providers}/${offer.provider.slug ?? offer.provider.id}`}
                    className="inline-flex min-w-0 items-center gap-1 text-sm font-black text-[#083228] hover:text-[#087a61]"
                >
                    <span className="truncate">{offer.provider.fullName}</span>
                    <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#087a61]" />
                </Link>
                  <p className="mt-1 text-xs font-semibold text-[#64748b]">
                    Elektrikçi
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[#334155]">
                    <Star className="h-3.5 w-3.5 fill-[#f5b326] text-[#f5b326]" />
                    {offer.provider.reviewCount > 0
                      ? `${offer.provider.ratingAvg} (${offer.provider.reviewCount})`
                      : "Yeni usta"}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-[#64748b]">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatDistanceKm(offer.distanceKm)} uzaklıkta
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-[#64748b]">
                    <BriefcaseBusiness className="h-3.5 w-3.5" />
                    {offer.provider.reviewCount || 98} tamamlanan iş
                  </p>
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  {recommended ? (
                    <span
                      className="rounded-full bg-[#eef8f5] px-3 py-1 text-[10px] font-black text-[#087a61]"
                      title="Fiyat, mesafe, puan ve yorum sayısına göre önerilir"
                    >
                      ÖNERİLEN USTA
                    </span>
                  ) : null}
                </div>
                <div className="rounded-lg border border-[#dfe7f0] bg-white px-4 py-3">
                  <p className="line-clamp-3 text-sm leading-6 text-[#243041]">
                    {offer.description}
                  </p>
                </div>
              </div>

              <div className="text-left lg:text-right">
                <p className="text-2xl font-black text-[#087a61]">
                  {offer.price.toLocaleString("tr-TR")} TL
                </p>
                <p className="mt-1 text-[11px] font-semibold text-[#64748b]">
                  Tahmini Süre
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#334155]">
                  <Clock className="h-3.5 w-3.5" />
                  {offer.estimatedDuration ?? "45 dk"}
                </p>
                {canAccept && offer.status === "PENDING" ? (
                  <Button
                    type="button"
                    className={cn(
                      "mt-3 h-10 w-full rounded-lg text-sm font-black",
                      recommended
                        ? "bg-[#087a61] hover:bg-[#06644f]"
                        : "bg-[#083228] hover:bg-[#052119]",
                    )}
                    disabled={actionId === offer.id}
                    onClick={() => accept(offer.id)}
                  >
                    {actionId === offer.id ? "İşleniyor..." : "Teklifi Kabul Et"}
                  </Button>
                ) : null}
                {acceptedOfferId === offer.id && requestStatus === "OFFER_ACCEPTED" ? (
                  <Button
                    type="button"
                    className="mt-3 h-10 w-full rounded-lg bg-[#087a61] text-sm font-black hover:bg-[#06644f]"
                    disabled={actionId === offer.id}
                    onClick={() => goToPayment(offer.id)}
                  >
                    {actionId === offer.id ? "Yönlendiriliyor..." : "Ödemeye git"}
                  </Button>
                ) : null}
              </div>
            </div>
          </article>
          );
        })
      )}
    </div>
  );
}
