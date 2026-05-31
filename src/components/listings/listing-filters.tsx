"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { NearMeButton } from "@/components/geo/near-me-button";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";
import { EVENT_LOCATION_CHANGED, ROUTES } from "@/lib/constants";
import { useServiceAreas } from "@/hooks/use-service-areas";
import { useUserLocation } from "@/hooks/use-user-location";

type Category = { id: string; name: string };

export function ListingFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location } = useUserLocation();
  const { provinces } = useServiceAreas();

  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "",
  );
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [district, setDistrict] = useState(searchParams.get("district") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "");
  const [lat, setLat] = useState(searchParams.get("lat") ?? "");
  const [lng, setLng] = useState(searchParams.get("lng") ?? "");

  const selectedProvince = provinces.find((p) => p.name === city);
  const districtOptions = selectedProvince?.towns ?? [];

  const activeFilterCount = useMemo(() => {
    return [categoryId, city, district, minPrice, maxPrice, sort].filter(Boolean)
      .length;
  }, [categoryId, city, district, minPrice, maxPrice, sort]);

  useEffect(() => {
    if (!searchParams.get("city") && location?.city) {
      setCity(location.city);
      setDistrict(location.district);
      setLat(String(location.lat));
      setLng(String(location.lng));

      if (!searchParams.get("sort")) {
        setSort("distance");
      }
    }
  }, [location, searchParams]);

  useEffect(() => {
    function syncFromHeader() {
      if (!location?.city) return;

      setCity(location.city);
      setDistrict(location.district);
      setLat(String(location.lat));
      setLng(String(location.lng));
    }

    window.addEventListener(EVENT_LOCATION_CHANGED, syncFromHeader);

    return () =>
      window.removeEventListener(EVENT_LOCATION_CHANGED, syncFromHeader);
  }, [location]);

  function applyFilters(overrides?: {
    lat?: string;
    lng?: string;
    sort?: string;
    city?: string;
    district?: string;
  }) {
    const params = new URLSearchParams();

    const useLat = overrides?.lat ?? lat;
    const useLng = overrides?.lng ?? lng;
    const useSort = overrides?.sort ?? sort;
    const useCity = overrides?.city ?? city;
    const useDistrict = overrides?.district ?? district;

    if (categoryId) params.set("categoryId", categoryId);
    if (useCity) params.set("city", useCity);
    if (useDistrict) params.set("district", useDistrict);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    if (useLat && useLng) {
      params.set("lat", useLat);
      params.set("lng", useLng);
    }

    if (useSort) params.set("sort", useSort);

    const q = params.toString();

    router.push(q ? `${ROUTES.listings}?${q}` : ROUTES.listings);
  }

  function handleNearMe(newLat: number, newLng: number) {
    setLat(String(newLat));
    setLng(String(newLng));
    setSort("distance");

    applyFilters({
      lat: String(newLat),
      lng: String(newLng),
      sort: "distance",
    });
  }

  function resetFilters() {
    setCategoryId("");
    setCity("");
    setDistrict("");
    setMinPrice("");
    setMaxPrice("");
    setSort("");
    setLat("");
    setLng("");

    router.push(ROUTES.listings);
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-[0_18px_55px_rgba(8,50,40,0.07)]">
      <div className="border-b border-black/5 bg-[#083228] p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/45">
              Arama filtreleri
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              İlanları daralt
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              Hizmeti, konumu ve fiyat aralığını seçerek en uygun ilanları
              listeleyin.
            </p>
          </div>

          {activeFilterCount > 0 ? (
            <div className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white">
              {activeFilterCount} aktif
            </div>
          ) : null}
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-2xl border border-[#087a61]/10 bg-[#f3fbf8] p-4">
          <div className="flex flex-col gap-3">
            <div>
              <h3 className="font-black text-[#083228]">
                Konuma göre sırala
              </h3>
              <p className="mt-1 text-sm leading-6 text-[#66736f]">
                Yakındaki ilanları öne çıkarmak için konumunuzu kullanın.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <NearMeButton onLocated={handleNearMe} label="Bana yakın" />

              {lat && lng ? (
                <p className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#087a61] shadow-sm">
                  Konum aktif
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={inputClassName}
            >
              <option value="">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
                İl
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setDistrict("");
                }}
                className={inputClassName}
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
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
                İlçe
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className={inputClassName}
                disabled={!city}
              >
                <option value="">Tüm ilçeler</option>
                {districtOptions.map((d) => (
                  <option key={d.slug} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
                Min fiyat
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className={inputClassName}
                placeholder="Örn. 500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
                Max fiyat
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className={inputClassName}
                placeholder="Örn. 5000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-black uppercase tracking-wide text-[#53635f]">
              Sıralama
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={inputClassName}
            >
              <option value="">Varsayılan</option>
              <option value="distance">Bana yakın</option>
              <option value="price_asc">Fiyat artan</option>
              <option value="price_desc">Fiyat azalan</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => applyFilters()}
            className="h-12 w-full rounded-2xl bg-[#087a61] text-sm font-black text-white hover:bg-[#076851]"
          >
            Filtreleri uygula
          </Button>

          {activeFilterCount > 0 || lat || lng ? (
            <button
              type="button"
              onClick={resetFilters}
              className="h-11 rounded-2xl border border-black/10 bg-white text-sm font-black text-[#53635f] transition hover:bg-[#f6f7f2] hover:text-[#083228]"
            >
              Filtreleri temizle
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}