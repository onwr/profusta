"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, Lock, Mail, Phone, UserRound } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthMethodDivider } from "@/components/auth/auth-method-divider";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { SocialAuthButton } from "@/components/auth/social-auth-button";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { getGoogleAuthErrorMessage } from "@/lib/auth/google-error-messages";
import { useUserLocation } from "@/hooks/use-user-location";

type Step = "choose" | "manual";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location, initialized, saveRegion } = useUserLocation();
  const [step, setStep] = useState<Step>("choose");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [provinceSlug, setProvinceSlug] = useState("");
  const [townSlug, setTownSlug] = useState("");
  const [lat, setLat] = useState(39.9334);
  const [lng, setLng] = useState(32.8597);

  const googleError = searchParams.get("error");
  const refParam = searchParams.get("ref");
  const googleHref = refParam
    ? `/api/auth/google?intent=register&ref=${encodeURIComponent(refParam)}`
    : "/api/auth/google?intent=register";

  useEffect(() => {
    const message = getGoogleAuthErrorMessage(googleError);
    if (message) {
      setError(message);
      setStep("choose");
    }
  }, [googleError]);

  useEffect(() => {
    if (searchParams.get("manual") === "1") {
      setStep("manual");
    }
  }, [searchParams]);

  useEffect(() => {
    if (initialized && location?.city && !city) {
      setCity(location.city);
      setDistrict(location.district);
      setProvinceSlug(location.provinceSlug);
      setTownSlug(location.townSlug);
      setLat(location.lat);
      setLng(location.lng);
    }
  }, [initialized, location, city]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!city || !district) {
      setError("Lütfen il ve ilçe seçin");
      return;
    }

    setLoading(true);

    const form = new FormData(e.currentTarget);

    const body = {
      fullName: form.get("fullName"),
      email: form.get("email"),
      phone: form.get("phone") || undefined,
      password: form.get("password"),
      city,
      district,
      referredByUserId: searchParams.get("ref") || undefined,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }

      if (provinceSlug && townSlug) {
        saveRegion({
          city,
          district,
          provinceSlug,
          townSlug,
          lat,
          lng,
        });
      }

      router.push(data.redirect ?? ROUTES.customer.dashboard);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Kayıt Ol"
      subtitle={
        step === "choose"
          ? "Google hesabınızla veya formu doldurarak kayıt olun."
          : "Bilgilerinizi girerek hesap oluşturun."
      }
      footer={
        <>
          <span className="text-[#53635f]">Zaten hesabınız var mı? </span>
          <Link href={ROUTES.login} className="font-black text-[#087a61]">
            Giriş Yap
          </Link>
        </>
      }
    >
      {step === "choose" ? (
        <div className="space-y-5">
          {refParam ? (
            <p className="rounded-2xl bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#087a61]">
              Arkadaşınızın davet linkiyle kayıt oluyorsunuz.
            </p>
          ) : null}

          {error ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <SocialAuthButton
            icon={<FcGoogle size={22} />}
            label="Google ile Devam Et"
            href={googleHref}
          />

          <AuthMethodDivider />

          <Button
            type="button"
            variant="outline"
            className="h-[56px] w-full text-sm font-black"
            onClick={() => {
              setError("");
              setStep("manual");
            }}
          >
            Manuel kayıt ol
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <button
            type="button"
            onClick={() => {
              setError("");
              setStep("choose");
            }}
            className="text-sm font-semibold text-[#087a61] hover:underline"
          >
            ← Diğer kayıt yöntemleri
          </button>

          {refParam ? (
            <p className="rounded-2xl bg-[#eef8f5] px-4 py-3 text-sm font-semibold text-[#087a61]">
              Arkadaşınızın davet linkiyle kayıt oluyorsunuz.
            </p>
          ) : null}

          <FormField label="Ad Soyad">
            <div className="relative">
              <UserRound className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="fullName"
                required
                autoComplete="name"
                className={`${inputClassName} pl-14`}
                placeholder="Adınızı ve soyadınızı girin"
              />
            </div>
          </FormField>

          <FormField label="E-posta Adresi">
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className={`${inputClassName} pl-14`}
                placeholder="E-posta adresinizi girin"
              />
            </div>
          </FormField>

          <FormField label="Telefon Numarası">
            <div className="relative">
              <Phone className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                className={`${inputClassName} pl-14`}
                placeholder="05xx xxx xx xx"
              />
            </div>
          </FormField>

          <div>
            <p className="mb-3 text-sm font-bold text-[#083228]">Bulunduğunuz bölge</p>
            <CityDistrictSelect
              city={city}
              district={district}
              onChange={(data) => {
                setCity(data.city);
                setDistrict(data.district);
                setProvinceSlug(data.provinceSlug);
                setTownSlug(data.townSlug);
                setLat(data.lat);
                setLng(data.lng);
              }}
            />
          </div>

          <FormField label="Şifre">
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
              <input
                name="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className={`${inputClassName} pl-14 pr-14`}
                placeholder="Şifrenizi girin"
              />
              <Eye className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />
            </div>
          </FormField>

          <p className="rounded-2xl bg-[#f4f8f6] px-4 py-3 text-xs font-medium leading-5 text-[#53635f]">
            Şifreniz en az 8 karakter olmalı, bir harf ve bir rakam içermelidir.
          </p>

          <label className="flex items-start gap-3 text-sm font-medium leading-6 text-[#53635f]">
            <input
              required
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-black/20 accent-[#087a61]"
            />
            <span>
              <Link
                href={ROUTES.static.terms}
                className="font-black text-[#087a61]"
              >
                Kullanım Şartları
              </Link>{" "}
              ve{" "}
              <Link
                href={ROUTES.static.privacy}
                className="font-black text-[#087a61]"
              >
                Gizlilik Politikası
              </Link>
              ’nı okudum, kabul ediyorum.
            </span>
          </label>

          {error ? (
            <p className="rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          ) : null}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Kaydediliyor..." : "Kayıt Ol"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
