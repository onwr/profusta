"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";
import { ROUTES } from "@/lib/constants";

const LocationMap = dynamic(
  () =>
    import("@/components/requests/location-map").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[320px] items-center justify-center rounded-2xl border border-black/10 bg-[#f4f7f6] text-sm text-[#53635f]">
        Harita yükleniyor...
      </div>
    ),
  },
);

type Category = { id: string; name: string; slug: string };

type ListingInitial = {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  price: number;
  city: string;
  district: string | null;
  latitude: number;
  longitude: number;
  serviceRadiusKm: number;
  rejectedReason?: string | null;
};

export function ListingForm({
  listingId,
  initial,
}: {
  listingId?: string;
  initial?: ListingInitial;
}) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial?.price != null ? String(initial.price) : "",
  );
  const [city, setCity] = useState(initial?.city ?? "");
  const [district, setDistrict] = useState(initial?.district ?? "");
  const [latitude, setLatitude] = useState(initial?.latitude ?? 39.9334);
  const [longitude, setLongitude] = useState(initial?.longitude ?? 32.8597);
  const [serviceRadiusKm, setServiceRadiusKm] = useState(
    String(initial?.serviceRadiusKm ?? 20),
  );
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        categoryId,
        title,
        description,
        price: Number(price),
        city,
        district: district || undefined,
        latitude,
        longitude,
        serviceRadiusKm: Number(serviceRadiusKm),
      }),
    );
    images.forEach((file) => formData.append("images", file));

    const url = listingId
      ? `/api/provider/listings/${listingId}`
      : "/api/provider/listings";
    const method = listingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }
      router.push(ROUTES.provider.listings);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      {initial?.rejectedReason ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Red sebebi: {initial.rejectedReason}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Kategori
        </label>
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputClassName}
        >
          <option value="">Seçin</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Başlık
        </label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClassName}
          minLength={5}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Açıklama
        </label>
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClassName}
          rows={5}
          minLength={20}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Fiyat (₺)
        </label>
        <input
          required
          type="number"
          min={1}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className={inputClassName}
        />
      </div>

      <CityDistrictSelect
        city={city}
        district={district}
        onChange={({ city: c, district: d, lat, lng }) => {
          setCity(c);
          setDistrict(d);
          setLatitude(lat);
          setLongitude(lng);
        }}
      />

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Hizmet yarıçapı (km)
        </label>
        <input
          type="number"
          min={5}
          max={100}
          value={serviceRadiusKm}
          onChange={(e) => setServiceRadiusKm(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div>
        <p className="mb-2 text-xs font-bold text-[#53635f]">Konum (harita)</p>
        <LocationMap
          latitude={latitude}
          longitude={longitude}
          onChange={(lat, lng) => {
            setLatitude(lat);
            setLongitude(lng);
          }}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-[#53635f]">
          Fotoğraflar {listingId ? "(değiştirmek için yeni seçin)" : ""}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files ?? []))}
          className="text-sm"
        />
      </div>

      <Button type="submit" disabled={loading} className="h-11">
        {loading
          ? "Kaydediliyor..."
          : listingId
            ? "Güncelle ve onaya gönder"
            : "İlan oluştur"}
      </Button>
    </form>
  );
}
