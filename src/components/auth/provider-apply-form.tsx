"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useUserLocation } from "@/hooks/use-user-location";
import { cn } from "@/lib/utils";

export function ProviderApplyForm() {
  const router = useRouter();
  const { location, initialized } = useUserLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [categoryOptions, setCategoryOptions] = useState<
    { slug: string; name: string }[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.categories ?? []) as { slug: string; name: string }[];
        setCategoryOptions(list.map((c) => ({ slug: c.slug, name: c.name })));
      });
  }, []);

  useEffect(() => {
    if (initialized && location?.city && !city) {
      setCity(location.city);
      setDistrict(location.district);
    }
  }, [initialized, location, city]);

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!city || !district) {
      setError("Lütfen il ve ilçe seçin");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("En az bir hizmet kategorisi seçin");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);

    const bioRaw = form.get("bio");
    const ibanRaw = form.get("iban");

    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      password: String(form.get("password") ?? ""),
      bio:
        typeof bioRaw === "string" && bioRaw.trim() ? bioRaw.trim() : undefined,
      iban:
        typeof ibanRaw === "string" && ibanRaw.trim()
          ? ibanRaw.trim()
          : undefined,
      baseCity: city,
      baseDistrict: district,
      serviceRadiusKm: Number(form.get("serviceRadiusKm") ?? 20),
      categories: selectedCategories,
      serviceAreas: [{ city, district }],
    };

    const submitData = new FormData();
    submitData.append("data", JSON.stringify(payload));

    for (const field of ["idCard", "tradeLicense", "certificate"] as const) {
      const file = form.get(field);
      if (file instanceof File && file.size > 0) {
        submitData.append(field, file);
      }
    }

    try {
      const res = await fetch("/api/auth/register/provider", {
        method: "POST",
        body: submitData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Başvuru başarısız");
        return;
      }
      router.push(data.redirect ?? "/giris?applied=1");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Usta Başvurusu"
      subtitle="Başvurunuz admin onayından sonra aktif olur"
      className="container"
      footer={
        <>
          <span className="text-[#53635f]">Zaten hesabınız var mı? </span>
          <Link href={ROUTES.login} className="font-bold text-[#087a61]">
            Giriş Yap
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="Ad Soyad">
          <input name="fullName" required className={inputClassName} />
        </FormField>
        <FormField label="E-posta">
          <input name="email" type="email" required className={inputClassName} />
        </FormField>
        <FormField label="Telefon">
          <input name="phone" type="tel" required className={inputClassName} />
        </FormField>
        <FormField label="Şifre">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className={inputClassName}
          />
        </FormField>

        <div>
          <p className="mb-3 text-sm font-bold text-[#083228]">Hizmet verdiğiniz bölge</p>
          <CityDistrictSelect
            city={city}
            district={district}
            onChange={(data) => {
              setCity(data.city);
              setDistrict(data.district);
            }}
          />
        </div>

        <FormField label="Hizmet yarıçapı (km)">
          <input
            name="serviceRadiusKm"
            type="number"
            min={5}
            max={100}
            defaultValue={20}
            className={inputClassName}
          />
        </FormField>

        <FormField label="Hizmet kategorileri">
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => toggleCategory(cat.slug)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition",
                  selectedCategories.includes(cat.slug)
                    ? "bg-[#087a61] text-white"
                    : "bg-[#eef8f5] text-[#083228] hover:bg-[#d9f0ea]",
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="IBAN (opsiyonel)">
          <input name="iban" className={inputClassName} />
        </FormField>
        <FormField label="Hakkınızda (opsiyonel)">
          <textarea name="bio" rows={3} className={inputClassName} />
        </FormField>

        <div className="space-y-3 rounded-2xl border border-black/5 bg-[#f7f7f3] p-4">
          <p className="text-sm font-black text-[#083228]">Belgeler (opsiyonel)</p>
          <p className="text-xs leading-5 text-[#53635f]">
            Kimlik veya ustalık belgenizi yükleyerek başvurunuzun daha hızlı
            onaylanmasını sağlayabilirsiniz.
          </p>
          <DocumentUpload name="idCard" label="Kimlik / Nüfus cüzdanı" />
          <DocumentUpload name="tradeLicense" label="Vergi levhası / İş yeri belgesi" />
          <DocumentUpload name="certificate" label="Ustalık / Sertifika belgesi" />
        </div>

        {error ? (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
        </Button>
      </form>
    </AuthCard>
  );
}

function DocumentUpload({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-black/10 bg-white px-4 py-3 transition hover:border-[#087a61]/30">
      <div>
        <p className="text-sm font-bold text-[#083228]">{label}</p>
        <p className="text-xs text-[#53635f]">PDF veya görsel, en fazla 10 MB</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
        <Upload className="h-4 w-4" />
      </div>
      <input
        name={name}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
      />
    </label>
  );
}
