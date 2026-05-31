"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  MapPin,
  Plus,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CustomerRequestRow = {
  id: string;
  status: string;
  city: string;
  district: string | null;
  createdAt: string;
  categoryName: string;
  serviceName: string | null;
  matchCount: number;
};

type FilterKey = "all" | "OPEN" | "OFFER_ACCEPTED" | "CANCELLED";

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  OFFER_ACCEPTED: "Teklif kabul edildi",
  CANCELLED: "İptal",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#eef8f5] text-[#087a61]",
  OFFER_ACCEPTED: "bg-[#dcf7e7] text-[#066b54]",
  CANCELLED: "bg-red-50 text-red-600",
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "OPEN", label: "Açık" },
  { key: "OFFER_ACCEPTED", label: "Kabul Edilen" },
  { key: "CANCELLED", label: "İptal" },
];

export function CustomerRequestsList({
  requests,
}: {
  requests: CustomerRequestRow[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(
    () => ({
      all: requests.length,
      OPEN: requests.filter((r) => r.status === "OPEN").length,
      OFFER_ACCEPTED: requests.filter((r) => r.status === "OFFER_ACCEPTED")
        .length,
      CANCELLED: requests.filter((r) => r.status === "CANCELLED").length,
    }),
    [requests],
  );

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#083228]">Talep Listesi</h2>
          <p className="mt-1 text-sm text-[#53635f]">
            {filter === "all"
              ? `Toplam ${requests.length} talep`
              : `${filtered.length} talep gösteriliyor`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Talep filtresi">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-4 py-2 text-xs font-black transition",
                filter === key
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "bg-[#FBFDF5] text-[#53635f] hover:bg-[#eef8f5] hover:text-[#087a61]",
              )}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-[#087a61]">
            <Sparkles className="h-8 w-8" />
          </div>
          <h3 className="mt-5 text-xl font-black text-[#083228]">
            Henüz talebiniz yok
          </h3>
          <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-[#53635f]">
            İlk hizmet talebinizi oluşturarak yakınınızdaki güvenilir ustalardan
            teklif almaya başlayın.
          </p>
          <Link
            href={ROUTES.createRequest}
            className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-6 text-sm font-black text-white"
          >
            <Plus className="h-4 w-4" />
            İlk Talebimi Oluştur
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/10 bg-[#fafaf8] p-10 text-center">
          <p className="text-sm font-semibold text-[#53635f]">
            Bu filtrede talep bulunamadı.
          </p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="mt-4 text-sm font-black text-[#087a61] hover:underline"
          >
            Tüm talepleri göster
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((request) => (
            <Link
              key={request.id}
              href={`${ROUTES.customer.requests}/${request.id}`}
              className="group rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_16px_38px_rgba(8,50,40,0.07)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex min-w-0 gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white text-xl font-black text-[#087a61] shadow-sm">
                    {request.categoryName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-lg font-black text-[#083228]">
                        {request.categoryName}
                      </h3>
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-black",
                          statusStyles[request.status] ??
                            "bg-[#f0f4f2] text-[#5a7a72]",
                        )}
                      >
                        {statusLabels[request.status] ?? request.status}
                      </span>
                    </div>
                    {request.serviceName ? (
                      <p className="mt-1 text-sm font-medium text-[#53635f]">
                        {request.serviceName}
                      </p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-[#53635f]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#087a61]" />
                        {request.city}
                        {request.district ? ` / ${request.district}` : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
                        {new Date(request.createdAt).toLocaleDateString(
                          "tr-TR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <UsersRound className="h-3.5 w-3.5 text-[#087a61]" />
                        {request.matchCount} usta eşleşti
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-3">
                  <span className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#087a61] shadow-sm">
                    {request.matchCount} teklif
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-black text-[#083228] transition group-hover:text-[#087a61]">
                    Detay
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
