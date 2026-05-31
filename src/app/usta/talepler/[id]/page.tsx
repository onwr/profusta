"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react";
import { ReadonlyLocationMap } from "@/components/geo/readonly-location-map";
import { OfferForm } from "@/components/offers/offer-form";
import { formatDistanceKm } from "@/lib/geo/haversine";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  OFFER_ACCEPTED: "Teklif kabul edildi",
  CANCELLED: "İptal",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#eef8f5] text-[#087a61]",
  OFFER_ACCEPTED: "bg-[#dcf7e7] text-[#10b981]",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function ProviderRequestDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<{
    request: {
      id: string;
      status: string;
      description: string;
      city: string;
      district: string | null;
      neighborhood: string | null;
      distanceKm: number;
      latitude: number;
      longitude: number;
      preferredDate: string | null;
      preferredTime: string | null;
      createdAt: string;
      category: { name: string };
      service: { name: string } | null;
      images: { url: string }[];
      customerName?: string;
    };
    myOffer: {
      id: string;
      price: number;
      description: string;
      estimatedDuration: string | null;
      proposedDate: string | null;
      status: string;
    } | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  function updateMyOffer(offer: NonNullable<typeof data>["myOffer"]) {
    setData((prev) => (prev ? { ...prev, myOffer: offer } : prev));
  }

  useEffect(() => {
    fetch(`/api/provider/requests/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.request) setData({ request: d.request, myOffer: d.myOffer ?? null });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-[#e5e7eb]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#e5e7eb]" />
      </div>
    );
  }

  if (!data?.request) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white p-8 text-center">
        <p className="text-sm text-[#5a7a72]">Talep bulunamadı.</p>
        <Link
          href={ROUTES.provider.requests}
          className="mt-4 inline-block text-sm font-bold text-[#087a61] hover:underline"
        >
          Taleplere dön
        </Link>
      </div>
    );
  }

  const { request, myOffer } = data;

  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.provider.requests}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#087a61] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Gelen talepler
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[28px] font-black leading-tight text-[#083228]">
              {request.category.name}
            </h1>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-black",
                statusStyles[request.status] ?? "bg-slate-100 text-slate-600",
              )}
            >
              {statusLabels[request.status] ?? request.status}
            </span>
          </div>
          {request.service ? (
            <p className="mt-1 text-sm text-[#5a7a72]">{request.service.name}</p>
          ) : null}
        </div>
        <p className="rounded-xl bg-[#eef8f5] px-4 py-2 text-sm font-black text-[#087a61]">
          {formatDistanceKm(request.distanceKm)}
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-black text-[#083228]">Talep detayı</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#5a7a72]">
              {request.description}
            </p>

            <ul className="mt-5 space-y-2 text-sm text-[#5a7a72]">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-[#087a61]" />
                {request.city}
                {request.district ? `, ${request.district}` : ""}
                {request.neighborhood ? ` · ${request.neighborhood}` : ""}
              </li>
              {request.preferredDate ? (
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-[#087a61]" />
                  Tercih edilen:{" "}
                  {new Date(request.preferredDate).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {request.preferredTime ? ` · ${request.preferredTime}` : ""}
                </li>
              ) : null}
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[#087a61]" />
                {new Date(request.createdAt).toLocaleString("tr-TR")}
              </li>
              {request.customerName ? (
                <li className="flex items-center gap-2">
                  <User className="h-4 w-4 shrink-0 text-[#087a61]" />
                  {request.customerName}
                </li>
              ) : null}
            </ul>
          </section>

          {request.images.length > 0 ? (
            <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h2 className="text-[15px] font-black text-[#083228]">Fotoğraflar</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {request.images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden rounded-xl bg-[#f8fcfa]"
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 200px"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
            <div className="border-b border-black/5 px-6 py-4">
              <h2 className="text-[15px] font-black text-[#083228]">Konum</h2>
            </div>
            <ReadonlyLocationMap
              latitude={request.latitude}
              longitude={request.longitude}
            />
          </section>
        </div>

        <div className="xl:col-span-5">
          {request.status === "OPEN" ? (
            <div className="sticky top-24">
              <OfferForm
                requestId={request.id}
                existingOffer={myOffer}
                onOfferSent={updateMyOffer}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-black/10 bg-white p-6 text-center shadow-sm">
              <p className="text-sm font-semibold text-[#5a7a72]">
                Bu talep artık yeni teklif kabul etmiyor.
              </p>
              {myOffer ? (
                <p className="mt-2 text-lg font-black text-[#083228]">
                  Teklifiniz: ₺{myOffer.price.toLocaleString("tr-TR")}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
