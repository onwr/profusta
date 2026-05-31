"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  MessageCircle,
  SearchX,
  Star,
} from "lucide-react";
import { NearMeButton } from "@/components/geo/near-me-button";
import { EVENT_LOCATION_CHANGED, ROUTES } from "@/lib/constants";
import { formatDistanceKm } from "@/lib/geo/haversine";
import { useServiceAreas } from "@/hooks/use-service-areas";
import { useUserLocation } from "@/hooks/use-user-location";
import { cn } from "@/lib/utils";

type ProviderItem = {
  id: string;
  slug: string | null;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  baseCity: string | null;
  baseDistrict: string | null;
  categories: string[];
  distanceKm: number | null;
  ratingAvg: number | null;
  reviewCount: number;
};

function formatCategory(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

function formatLocation(city: string | null, district: string | null) {
  if (!city) return null;
  return district ? `${city}, ${district}` : city;
}

export function ProvidersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { provinces } = useServiceAreas();
  const { location } = useUserLocation();

  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [sort, setSort] = useState(
    searchParams.get("sort") === "recent" ? "recent" : "distance",
  );
  const [lat, setLat] = useState(searchParams.get("lat") ?? "");
  const [lng, setLng] = useState(searchParams.get("lng") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  function fetchProviders(params: URLSearchParams) {
    setLoading(true);
    fetch(`/api/providers?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        setProviders(d.providers ?? []);
        setLoading(false);
      });
  }

  useEffect(() => {
    if (!searchParams.get("city") && location?.city) {
      queueMicrotask(() => {
        setCity(location.city);
        setLat(String(location.lat));
        setLng(String(location.lng));
      });
    }
  }, [location, searchParams]);

  useEffect(() => {
    function syncFromHeader() {
      if (!location?.city) return;
      setCity(location.city);
      setLat(String(location.lat));
      setLng(String(location.lng));
    }
    window.addEventListener(EVENT_LOCATION_CHANGED, syncFromHeader);
    return () => window.removeEventListener(EVENT_LOCATION_CHANGED, syncFromHeader);
  }, [location]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (lat && lng) {
      params.set("lat", lat);
      params.set("lng", lng);
    }
    if (query.trim()) params.set("q", query.trim());
    params.set("sort", sort);
    queueMicrotask(() => fetchProviders(params));
  }, [city, lat, lng, sort, query]);

  function applyNearMe(newLat: number, newLng: number) {
    setLat(String(newLat));
    setLng(String(newLng));
    setSort("distance");
    const params = new URLSearchParams({
      lat: String(newLat),
      lng: String(newLng),
      sort: "distance",
    });
    if (city) params.set("city", city);
    router.push(`${ROUTES.providers}?${params.toString()}`);
  }

  function changeCity(value: string) {
    setCity(value);
    const params = new URLSearchParams();
    if (value) params.set("city", value);
    if (lat && lng) {
      params.set("lat", lat);
      params.set("lng", lng);
    }
    if (query.trim()) params.set("q", query.trim());
    params.set("sort", sort);
    router.push(`${ROUTES.providers}?${params.toString()}`);
  }

  function applySearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (lat && lng) {
      params.set("lat", lat);
      params.set("lng", lng);
    }
    if (query.trim()) params.set("q", query.trim());
    params.set("sort", sort);
    router.push(`${ROUTES.providers}?${params.toString()}`);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 rounded-3xl border border-black/5 bg-white p-5 shadow-[0_8px_30px_rgba(8,50,40,0.05)] sm:p-6">
        <form onSubmit={applySearch} className="min-w-[220px] flex-1">
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            Usta ara
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="İsim veya hizmet alanı..."
            className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-[#083228] outline-none transition focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
          />
        </form>

        <NearMeButton onLocated={applyNearMe} label="Bana yakın" />

        <div className="min-w-[180px] flex-1 sm:flex-none">
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            İl
          </label>
          <select
            value={city}
            onChange={(e) => changeCity(e.target.value)}
            className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm font-semibold text-[#083228] outline-none transition focus:border-[#087a61]/40 focus:ring-2 focus:ring-[#087a61]/10"
          >
            <option value="">Tüm iller</option>
            {provinces.map((p) => (
              <option key={p.slug} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-black text-[#53635f]">
            Sıralama
          </label>
          <div className="inline-flex rounded-xl bg-[#eef8f5] p-1">
            <button
              type="button"
              onClick={() => setSort("distance")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-black transition",
                sort === "distance"
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "text-[#083228] hover:text-[#087a61]",
              )}
            >
              Mesafe
            </button>
            <button
              type="button"
              onClick={() => setSort("recent")}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-black transition",
                sort === "recent"
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "text-[#083228] hover:text-[#087a61]",
              )}
            >
              En yeni
            </button>
          </div>
        </div>
      </div>

      {!loading && providers.length > 0 ? (
        <p className="mt-6 text-sm font-bold text-[#53635f]">
          {providers.length} usta bulundu
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-[26px] border border-black/5 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div className="h-16 w-16 rounded-3xl bg-[#eef2f0]" />
                <div className="h-6 w-20 rounded-full bg-[#eef2f0]" />
              </div>
              <div className="mt-4 h-5 w-2/3 rounded-full bg-[#eef2f0]" />
              <div className="mt-3 h-4 w-1/2 rounded-full bg-[#eef2f0]" />
              <div className="mt-5 h-12 w-full rounded-2xl bg-[#eef2f0]" />
            </div>
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className="mt-6 rounded-[26px] border border-dashed border-[#087a61]/25 bg-white p-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
            <SearchX className="h-8 w-8" />
          </div>
          <h3 className="mt-4 text-lg font-black text-[#083228]">
            Usta bulunamadı
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#53635f]">
            Seçtiğiniz bölgede onaylı usta bulunamadı. Farklı bir il seçebilir
            veya filtreleri sıfırlayabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => {
            const href = `${ROUTES.providers}/${p.slug ?? p.id}`;
            const locationLabel = formatLocation(p.baseCity, p.baseDistrict);
            const visibleCategories = p.categories.slice(0, 2);
            const extraCategories = p.categories.length - visibleCategories.length;

            return (
              <article
                key={p.id}
                className="group flex flex-col rounded-[26px] border border-black/5 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#087a61]/20 hover:shadow-[0_18px_42px_rgba(8,50,40,0.08)]"
              >
                <div className="flex items-start justify-between gap-3">
                  {p.avatarUrl ? (
                    <Image
                      src={p.avatarUrl}
                      alt={p.fullName}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded-3xl object-cover shadow-sm"
                    />
                  ) : (
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-xl font-black text-[#087a61] shadow-sm">
                      {p.fullName.charAt(0).toLocaleUpperCase("tr-TR")}
                    </div>
                  )}

                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef8f5] px-2.5 py-1 text-[11px] font-black text-[#087a61]">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Onaylı
                  </span>
                </div>

                <h2 className="mt-4 line-clamp-1 text-lg font-black text-[#083228]">
                  {p.fullName}
                </h2>

                <div className="mt-2 space-y-1.5">
                  {locationLabel ? (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#53635f]">
                      <MapPin className="h-4 w-4 text-[#087a61]" />
                      {locationLabel}
                      {p.distanceKm != null ? (
                        <span className="text-[#7b8b87]">
                          · {formatDistanceKm(p.distanceKm)}
                        </span>
                      ) : null}
                    </p>
                  ) : null}

                  {p.ratingAvg != null ? (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-[#53635f]">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {p.ratingAvg} / 5
                      <span className="font-medium text-[#7b8b87]">
                        ({p.reviewCount} yorum)
                      </span>
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#7b8b87]">
                      <Star className="h-4 w-4 text-[#cbd5d0]" />
                      Henüz değerlendirme yok
                    </p>
                  )}
                </div>

                {p.categories.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {visibleCategories.map((slug) => (
                      <span
                        key={slug}
                        className="rounded-full bg-[#f5f7fb] px-2.5 py-1 text-[11px] font-black text-[#53635f]"
                      >
                        {formatCategory(slug)}
                      </span>
                    ))}
                    {extraCategories > 0 ? (
                      <span className="rounded-full bg-[#f5f7fb] px-2.5 py-1 text-[11px] font-black text-[#7b8b87]">
                        +{extraCategories}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-[1fr_48px] gap-2 pt-1">
                  <Link
                    href={href}
                    className="flex h-12 items-center justify-center gap-1.5 rounded-2xl border border-[#087a61]/20 bg-white text-sm font-black text-[#087a61] transition group-hover:bg-[#eef8f5]"
                  >
                    Profili Gör
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`${href}#mesaj`}
                    className="grid h-12 place-items-center rounded-2xl bg-[#087a61] text-white shadow-[0_12px_28px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
                    aria-label="Mesaj gönder"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
