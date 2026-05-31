"use client";

import { useEffect, useState } from "react";
import { NearMeButton } from "@/components/geo/near-me-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export function ListingsLocationBanner({
  hasLocation,
}: {
  hasLocation: boolean;
}) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (hasLocation) setDismissed(true);
  }, [hasLocation]);

  if (hasLocation || dismissed) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-[1.7rem] border border-[#087a61]/10 bg-white shadow-[0_18px_55px_rgba(8,50,40,0.07)]">
      <div className="flex flex-col gap-5 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.13),transparent_32%)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef8f5] text-xl">
            📍
          </div>

          <div>
            <h2 className="font-black text-[#083228]">
              Yakındaki ilanları öne çıkaralım
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#66736f]">
              Konum izni verdiğinizde sistem size en yakın ustaların ilanlarını
              mesafeye göre sıralar.
            </p>
          </div>
        </div>

        <NearMeButton
          label="Konumumu kullan"
          onLocated={(lat, lng) => {
            const params = new URLSearchParams({
              lat: String(lat),
              lng: String(lng),
              sort: "distance",
            });

            router.push(`${ROUTES.listings}?${params.toString()}`);
          }}
        />
      </div>
    </div>
  );
}