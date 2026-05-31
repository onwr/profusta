"use client";

import { useEffect, useMemo, useState } from "react";
import { inputClassName } from "@/components/auth/form-field";
import { useServiceAreas } from "@/hooks/use-service-areas";
import type { TownData } from "@/lib/geo/turkey";

type Props = {
  city: string;
  district: string;
  onChange: (data: {
    city: string;
    district: string;
    provinceSlug: string;
    townSlug: string;
    lat: number;
    lng: number;
  }) => void;
  labelClassName?: string;
  selectClassName?: string;
  cityLabel?: string;
  districtLabel?: string;
};

export function CityDistrictSelect({
  city,
  district,
  onChange,
  labelClassName = "mb-1 block text-sm font-bold text-[#083228]",
  selectClassName = inputClassName,
  cityLabel = "İl",
  districtLabel = "İlçe",
}: Props) {
  const { provinces, hasAreas, loading } = useServiceAreas();
  const [districts, setDistricts] = useState<TownData[]>([]);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.name === city),
    [provinces, city],
  );

  useEffect(() => {
    if (selectedProvince) {
      setDistricts(selectedProvince.towns);
    } else {
      setDistricts([]);
    }
  }, [selectedProvince]);

  function emit(cityName: string, districtName: string) {
    const province = provinces.find((p) => p.name === cityName);
    const town = province?.towns.find((t) => t.name === districtName);
    onChange({
      city: cityName,
      district: districtName,
      provinceSlug: province?.slug ?? "",
      townSlug: town?.slug ?? "",
      lat: town?.lat ?? province?.lat ?? 39.9334,
      lng: town?.lng ?? province?.lng ?? 32.8597,
    });
  }

  function updateCity(newCity: string) {
    const province = provinces.find((p) => p.name === newCity);
    const newDistrict = province?.towns[0]?.name ?? "";
    emit(newCity, newDistrict);
  }

  function updateDistrict(newDistrict: string) {
    emit(city, newDistrict);
  }

  if (!loading && !hasAreas) {
    return (
      <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
        Henüz hizmet verilen bölge tanımlanmadı. Lütfen daha sonra tekrar deneyin.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className={labelClassName}>{cityLabel}</label>
        <select
          value={city}
          onChange={(e) => updateCity(e.target.value)}
          required
          disabled={loading || provinces.length === 0}
          className={selectClassName}
        >
          <option value="">Seçin</option>
          {provinces.map((p) => (
            <option key={p.slug} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClassName}>{districtLabel}</label>
        <select
          value={district}
          onChange={(e) => updateDistrict(e.target.value)}
          className={selectClassName}
          disabled={!city || districts.length === 0}
          required
        >
          <option value="">Seçin</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.name}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
