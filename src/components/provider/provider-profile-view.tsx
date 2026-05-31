"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { ProviderAvatarActions } from "@/components/provider/provider-avatar";
import { ROUTES } from "@/lib/constants";
import {
  formatIbanDisplay,
  isValidTurkishIban,
  normalizeIban,
  sanitizeIbanInput,
  TURKISH_IBAN_FORMAT_HINT,
} from "@/lib/validations/iban";
import { cn } from "@/lib/utils";

const inputClass =
  "h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] px-4 text-sm font-medium text-[#083228] outline-none transition focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20";

const textareaClass =
  "w-full resize-y rounded-xl border border-black/10 bg-[#f8fafc] px-4 py-3 text-sm text-[#083228] outline-none transition focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20";

type ProfileData = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  bio: string;
  iban: string;
  baseCity: string;
  baseDistrict: string;
  baseLatitude: number | null;
  baseLongitude: number | null;
  serviceRadiusKm: string;
  categories: { categorySlug: string; name: string }[];
  faqs: { question: string; answer: string }[];
};

const emptyProfile: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  avatarUrl: null,
  bio: "",
  iban: "",
  baseCity: "",
  baseDistrict: "",
  baseLatitude: null,
  baseLongitude: null,
  serviceRadiusKm: "20",
  categories: [],
  faqs: [],
};

export function ProviderProfileView() {
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ibanError, setIbanError] = useState("");

  useEffect(() => {
    fetch("/api/provider/profile")
      .then((r) => r.json())
      .then((data) => {
        const p = data.provider;
        if (p) {
          setProfile({
            fullName: p.user?.fullName ?? "",
            email: p.user?.email ?? "",
            phone: p.user?.phone ?? "",
            avatarUrl: p.user?.avatarUrl ?? null,
            bio: p.bio ?? "",
            iban: p.iban ? formatIbanDisplay(p.iban) : "",
            baseCity: p.baseCity ?? "",
            baseDistrict: p.baseDistrict ?? "",
            baseLatitude: p.baseLatitude ?? null,
            baseLongitude: p.baseLongitude ?? null,
            serviceRadiusKm: String(p.serviceRadiusKm ?? 20),
            categories: p.categories ?? [],
            faqs:
              p.faqs?.map((faq: { question: string; answer: string }) => ({
                question: faq.question ?? "",
                answer: faq.answer ?? "",
              })) ?? [],
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleIbanChange(raw: string) {
    const formatted = sanitizeIbanInput(raw);
    setProfile((prev) => ({ ...prev, iban: formatted }));
    if (!formatted.trim()) {
      setIbanError("");
      return;
    }
    setIbanError(
      isValidTurkishIban(formatted)
        ? ""
        : "Geçerli bir TR IBAN girin (26 karakter, mod-97 kontrolü)",
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const ibanNormalized = normalizeIban(profile.iban);
    if (ibanNormalized && !isValidTurkishIban(ibanNormalized)) {
      setIbanError(
        "Geçerli bir TR IBAN girin (26 karakter, örn. TR33 0006 1005 1978 6457 8413 26)",
      );
      return;
    }

    if (!profile.baseCity.trim() || !profile.baseDistrict.trim()) {
      setError("Lütfen il ve ilçe seçin");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/provider/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: profile.bio,
          iban: ibanNormalized || "",
          baseCity: profile.baseCity,
          baseDistrict: profile.baseDistrict,
          baseLatitude: profile.baseLatitude ?? undefined,
          baseLongitude: profile.baseLongitude ?? undefined,
          serviceRadiusKm: Number(profile.serviceRadiusKm),
          faqs: profile.faqs,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Profil güncellenemedi");
        return;
      }
      const savedIban = data.provider?.iban as string | null | undefined;
      setProfile((prev) => ({
        ...prev,
        iban: savedIban ? formatIbanDisplay(savedIban) : "",
      }));
      setIbanError("");
      setMessage("Profil başarıyla güncellendi");
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSaving(false);
    }
  }

  const hasValidIban =
    profile.iban.trim().length > 0 && isValidTurkishIban(profile.iban);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-[#f8fcfa]" />
        <div className="h-40 animate-pulse rounded-2xl bg-[#f8fcfa]" />
        <div className="h-64 animate-pulse rounded-2xl bg-[#f8fcfa]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-black leading-tight text-[#083228]">
          Profilim
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          Profil bilgileriniz, ödeme hesabı ve hizmet bölgeniz
        </p>
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h2 className="text-[15px] font-black text-[#083228]">Profil fotoğrafı</h2>
        <p className="mt-1 text-xs text-[#5a7a72]">
          Sidebar ve üst barda görünür
        </p>
        <div className="mt-5">
          <ProviderAvatarActions
            userName={profile.fullName || "Usta"}
            avatarUrl={profile.avatarUrl}
            onChange={(url) =>
              setProfile((prev) => ({ ...prev, avatarUrl: url }))
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <h2 className="text-[15px] font-black text-[#083228]">İletişim</h2>
        <p className="mt-1 text-xs text-[#5a7a72]">
          E-posta ve telefon değişikliği için destek ile iletişime geçin
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-[#5a7a72]">E-posta</dt>
              <dd className="truncate text-sm font-bold text-[#083228]">
                {profile.email || "—"}
              </dd>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
              <Phone className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs font-semibold text-[#5a7a72]">Telefon</dt>
              <dd className="truncate text-sm font-bold text-[#083228]">
                {profile.phone || "—"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      {profile.categories.length > 0 ? (
        <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-black text-[#083228]">
                Hizmet kategorileri
              </h2>
              <p className="mt-1 text-xs text-[#5a7a72]">
                Talep eşleşmelerinde kullanılan hizmet alanlarınız
              </p>
            </div>
            <Link
              href={ROUTES.provider.categories}
              className="text-xs font-bold text-[#087a61] hover:underline"
            >
              Tümünü gör
            </Link>
          </div>
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.categories.map((c) => (
              <li
                key={c.categorySlug}
                className="rounded-full bg-[#eef8f5] px-3 py-1.5 text-xs font-bold text-[#087a61]"
              >
                {c.name}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      >
        <div>
          <h2 className="text-[15px] font-black text-[#083228]">Profil bilgileri</h2>
          <p className="mt-1 text-xs text-[#5a7a72]">
            Müşterilerin gördüğü açıklama ve konum ayarları
          </p>
        </div>

        {message ? (
          <p className="flex items-center gap-2 rounded-xl bg-[#dcf7e7] px-4 py-3 text-sm font-semibold text-[#10b981]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <div>
          <label htmlFor="bio" className="mb-1.5 block text-xs font-bold text-[#5a7a72]">
            Hakkınızda
          </label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) =>
              setProfile((prev) => ({ ...prev, bio: e.target.value }))
            }
            rows={4}
            maxLength={1000}
            placeholder="Deneyiminiz, uzmanlık alanlarınız..."
            className={textareaClass}
          />
          <p className="mt-1 text-right text-[10px] text-[#9ca3af]">
            {profile.bio.length}/1000
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-[#f8fafc] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xs font-black text-[#083228]">
                Profil S.S.S
              </h3>
              <p className="mt-1 text-xs text-[#5a7a72]">
                Usta detay sayfanızdaki S.S.S tabında görünür.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  faqs: [...prev.faqs, { question: "", answer: "" }],
                }))
              }
              disabled={profile.faqs.length >= 8}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#087a61] px-3 text-xs font-black text-white disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" />
              Soru Ekle
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {profile.faqs.length === 0 ? (
              <p className="rounded-xl border border-dashed border-black/10 bg-white p-4 text-sm text-[#5a7a72]">
                Henüz soru eklenmedi.
              </p>
            ) : (
              profile.faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-black/5 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1 space-y-3">
                      <input
                        type="text"
                        value={faq.question}
                        maxLength={160}
                        placeholder="Soru başlığı"
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            faqs: prev.faqs.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, question: e.target.value }
                                : item,
                            ),
                          }))
                        }
                        className={inputClass}
                      />
                      <textarea
                        value={faq.answer}
                        maxLength={1000}
                        rows={3}
                        placeholder="Cevap"
                        onChange={(e) =>
                          setProfile((prev) => ({
                            ...prev,
                            faqs: prev.faqs.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, answer: e.target.value }
                                : item,
                            ),
                          }))
                        }
                        className={textareaClass}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setProfile((prev) => ({
                          ...prev,
                          faqs: prev.faqs.filter(
                            (_item, itemIndex) => itemIndex !== index,
                          ),
                        }))
                      }
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                      aria-label="Soruyu sil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#087a61]/15 bg-[#eef8f5] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <label htmlFor="iban" className="block text-xs font-bold text-[#083228]">
                IBAN (ödeme hesabı)
              </label>
              <p className="mt-1 text-xs text-[#5a7a72]">
                Para çekim taleplerinde kullanılır. Format: {TURKISH_IBAN_FORMAT_HINT}
              </p>
            </div>
            {hasValidIban ? (
              <Link
                href={ROUTES.provider.payouts}
                className="inline-flex items-center gap-1 rounded-full bg-[#087a61] px-3 py-1.5 text-[10px] font-black text-white hover:bg-[#066b54]"
              >
                <Wallet className="h-3 w-3" />
                Para çek
              </Link>
            ) : null}
          </div>
          <input
            id="iban"
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            value={profile.iban}
            onChange={(e) => handleIbanChange(e.target.value)}
            onBlur={() => {
              if (profile.iban.trim()) {
                handleIbanChange(profile.iban);
              }
            }}
            placeholder={TURKISH_IBAN_FORMAT_HINT}
            className={cn(inputClass, "mt-3 font-mono tracking-wide", ibanError && "border-red-400 focus:border-red-400 focus:ring-red-200")}
            aria-invalid={Boolean(ibanError)}
            aria-describedby={ibanError ? "iban-error" : undefined}
          />
          {ibanError ? (
            <p id="iban-error" className="mt-2 text-xs font-semibold text-red-600">
              {ibanError}
            </p>
          ) : profile.iban.trim() && !ibanError ? (
            <p className="mt-2 text-xs font-semibold text-[#10b981]">
              IBAN formatı geçerli
            </p>
          ) : null}
        </div>

        <CityDistrictSelect
          city={profile.baseCity}
          district={profile.baseDistrict}
          cityLabel="Şehir"
          districtLabel="İlçe"
          labelClassName="mb-1.5 block text-xs font-bold text-[#5a7a72]"
          selectClassName={inputClass}
          onChange={(data) =>
            setProfile((prev) => ({
              ...prev,
              baseCity: data.city,
              baseDistrict: data.district,
              baseLatitude: data.lat,
              baseLongitude: data.lng,
            }))
          }
        />

        <div>
          <label
            htmlFor="serviceRadiusKm"
            className="mb-1.5 flex items-center gap-1 text-xs font-bold text-[#5a7a72]"
          >
            <MapPin className="h-3.5 w-3.5" />
            Hizmet yarıçapı (km)
          </label>
          <input
            id="serviceRadiusKm"
            type="number"
            min={5}
            max={100}
            value={profile.serviceRadiusKm}
            onChange={(e) =>
              setProfile((prev) => ({
                ...prev,
                serviceRadiusKm: e.target.value,
              }))
            }
            className={inputClass}
          />
          <p className="mt-1 text-[10px] text-[#9ca3af]">5–100 km arası</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || Boolean(ibanError)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#087a61] px-8 text-sm font-bold text-white hover:bg-[#066b54] disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </button>
          <Link
            href={ROUTES.provider.areas}
            className="inline-flex h-11 items-center rounded-xl border border-black/10 px-5 text-sm font-bold text-[#5a7a72] hover:bg-[#f8fcfa]"
          >
            Hizmet bölgeleri
          </Link>
        </div>
      </form>
    </div>
  );
}
