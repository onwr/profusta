"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { FormField, inputClassName } from "@/components/auth/form-field";
import {
  CategoryPicker,
  type CategoryPickerItem,
} from "@/components/category/category-picker";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useUserLocation } from "@/hooks/use-user-location";
import { cn } from "@/lib/utils";
import {
  isValidTurkishIban,
  normalizeIban,
  sanitizeIbanInput,
  TURKISH_IBAN_FORMAT_HINT,
} from "@/lib/validations/iban";
import {
  isValidTurkishPhone,
  normalizeTurkishPhone,
  sanitizeTurkishPhoneInput,
  TURKISH_PHONE_FORMAT_HINT,
} from "@/lib/validations/phone";

export function ProviderApplyForm() {
  const router = useRouter();
  const { location, initialized } = useUserLocation();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [iban, setIban] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [ibanError, setIbanError] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryInvalid, setCategoryInvalid] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<CategoryPickerItem[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.categories ?? []) as {
          slug: string;
          name: string;
          icon: string | null;
          description: string | null;
          coverImageUrl: string | null;
          _count?: { services: number };
        }[];
        setCategoryOptions(
          list.map((c) => ({
            slug: c.slug,
            name: c.name,
            icon: c.icon,
            description: c.description,
            coverImageUrl: c.coverImageUrl,
            serviceCount: c._count?.services ?? 0,
          })),
        );
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  useEffect(() => {
    if (initialized && location?.city && !city) {
      setCity(location.city);
      setDistrict(location.district);
    }
  }, [initialized, location, city]);


  function handlePhoneChange(raw: string) {
    const formatted = sanitizeTurkishPhoneInput(raw);
    setPhone(formatted);
    const digits = normalizeTurkishPhone(formatted);
    if (!digits) {
      setPhoneError("");
      return;
    }
    if (digits.length < 11) {
      setPhoneError("");
      return;
    }
    setPhoneError(
      isValidTurkishPhone(formatted)
        ? ""
        : `Geçerli bir cep telefonu girin (örn. ${TURKISH_PHONE_FORMAT_HINT})`,
    );
  }

  function handleIbanChange(raw: string) {
    const formatted = sanitizeIbanInput(raw);
    setIban(formatted);
    if (!formatted.trim()) {
      setIbanError("");
      return;
    }
    setIbanError(
      isValidTurkishIban(formatted)
        ? ""
        : `Geçerli bir TR IBAN girin (örn. ${TURKISH_IBAN_FORMAT_HINT})`,
    );
  }

  function validatePhoneField(): boolean {
    const digits = normalizeTurkishPhone(phone);
    if (!digits) {
      setPhoneError("Telefon numarası gerekli");
      return false;
    }
    if (!isValidTurkishPhone(phone)) {
      setPhoneError(
        `Geçerli bir cep telefonu girin (örn. ${TURKISH_PHONE_FORMAT_HINT})`,
      );
      return false;
    }
    setPhoneError("");
    return true;
  }

  function validateIbanField(): boolean {
    const normalized = normalizeIban(iban);
    if (!normalized) {
      setIbanError("");
      return true;
    }
    if (!isValidTurkishIban(normalized)) {
      setIbanError(
        `Geçerli bir TR IBAN girin (örn. ${TURKISH_IBAN_FORMAT_HINT})`,
      );
      return false;
    }
    setIbanError("");
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!city || !district) {
      setError("Lütfen il ve ilçe seçin");
      return;
    }

    if (selectedCategories.length === 0) {
      setCategoryInvalid(true);
      setError("En az bir hizmet kategorisi seçin");
      return;
    }

    setCategoryInvalid(false);

    if (!validatePhoneField() || !validateIbanField()) {
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);
    const bioRaw = form.get("bio");
    const ibanNormalized = normalizeIban(iban);

    const payload = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: normalizeTurkishPhone(phone),
      password: String(form.get("password") ?? ""),
      bio:
        typeof bioRaw === "string" && bioRaw.trim() ? bioRaw.trim() : undefined,
      iban: ibanNormalized || undefined,
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

  const phoneValid =
    normalizeTurkishPhone(phone).length === 11 && isValidTurkishPhone(phone);
  const ibanValid =
    iban.trim().length > 0 && isValidTurkishIban(iban) && !ibanError;

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
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={validatePhoneField}
            placeholder={TURKISH_PHONE_FORMAT_HINT}
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? "phone-error" : undefined}
            className={cn(
              inputClassName,
              "tracking-wide",
              phoneError && "border-red-400 focus:border-red-400 focus:ring-red-200",
            )}
          />
          {phoneError ? (
            <p id="phone-error" className="mt-1.5 text-xs font-semibold text-red-600">
              {phoneError}
            </p>
          ) : phoneValid ? (
            <p className="mt-1.5 text-xs font-semibold text-[#10b981]">
              Telefon formatı geçerli
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[#53635f]">
              Cep telefonu formatı: {TURKISH_PHONE_FORMAT_HINT}
            </p>
          )}
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

        <CategoryPicker
          categories={categoryOptions}
          selected={selectedCategories}
          onChange={(slugs) => {
            setCategoryInvalid(false);
            setSelectedCategories(slugs);
          }}
          loading={categoriesLoading}
          invalid={categoryInvalid}
        />

        <FormField label="IBAN (opsiyonel)">
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={iban}
            onChange={(e) => handleIbanChange(e.target.value)}
            onBlur={() => {
              if (iban.trim()) validateIbanField();
            }}
            placeholder={TURKISH_IBAN_FORMAT_HINT}
            aria-invalid={Boolean(ibanError)}
            aria-describedby={ibanError ? "iban-error" : undefined}
            className={cn(
              inputClassName,
              "font-mono tracking-wide",
              ibanError && "border-red-400 focus:border-red-400 focus:ring-red-200",
            )}
          />
          {ibanError ? (
            <p id="iban-error" className="mt-1.5 text-xs font-semibold text-red-600">
              {ibanError}
            </p>
          ) : ibanValid ? (
            <p className="mt-1.5 text-xs font-semibold text-[#10b981]">
              IBAN formatı geçerli
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-[#53635f]">
              Ödeme hesabı için TR IBAN: {TURKISH_IBAN_FORMAT_HINT}
            </p>
          )}
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

        <Button
          type="submit"
          disabled={loading || Boolean(phoneError) || Boolean(ibanError)}
          className="w-full"
        >
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
