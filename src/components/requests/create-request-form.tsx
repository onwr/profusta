"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Armchair,
  Bath,
  Bolt,
  CalendarClock,
  Check,
  ChevronRight,
  DoorOpen,
  Info,
  Grid2X2,
  Home,
  ImagePlus,
  Loader2,
  Paintbrush,
  Plus,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Thermometer,
  WashingMachine,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { CityDistrictSelect } from "@/components/geo/city-district-select";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { useUserLocation } from "@/hooks/use-user-location";
import { cn } from "@/lib/utils";

const LocationMap = dynamic(
  () => import("@/components/requests/location-map").then((m) => m.LocationMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[120px] items-center justify-center rounded-xl border border-black/5 bg-[#eef8f5] text-sm text-[#53635f]">
        Harita yükleniyor...
      </div>
    ),
  },
);

type Category = {
  id: string;
  slug: string;
  name: string;
  services?: { id: string; slug: string; name: string }[];
};

const fieldClass =
  "w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-[#083228] outline-none transition placeholder:text-[#8a9995] focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/10";

function categoryIcon(name: string, index: number) {
  const lower = name.toLocaleLowerCase("tr-TR");
  if (lower.includes("klima")) return Snowflake;
  if (lower.includes("kombi")) return Thermometer;
  if (lower.includes("elektrik")) return Zap;
  if (lower.includes("tesisat") || lower.includes("su")) return Bath;
  if (lower.includes("beyaz") || lower.includes("çamaşır")) return WashingMachine;
  if (lower.includes("mobilya")) return Armchair;
  if (lower.includes("kapı") || lower.includes("pencere")) return DoorOpen;
  if (lower.includes("temizlik")) return Paintbrush;
  return [Grid2X2, Wrench, Bolt][index % 3] ?? Wrench;
}

export function CreateRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { location, initialized } = useUserLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [latitude, setLatitude] = useState(39.9334);
  const [longitude, setLongitude] = useState(32.8597);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<
    { url: string; name: string }[]
  >([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [urgency, setUrgency] = useState<"normal" | "rush" | "urgent">("normal");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (initialized && location?.city && !city) {
      queueMicrotask(() => {
        setCity(location.city);
        setDistrict(location.district);
        setLatitude(location.lat);
        setLongitude(location.lng);
      });
    }
  }, [initialized, location, city]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const list: Category[] = data.categories ?? [];
        setCategories(list);

        const catSlug = searchParams.get("kategori");
        const svcSlug = searchParams.get("hizmet");
        if (!catSlug) return;

        const cat = list.find((c) => c.slug === catSlug);
        if (!cat) return;

        setCategoryId(cat.id);
        fetch(`/api/categories/${catSlug}`)
          .then((r) => r.json())
          .then((detail) => {
            const full = detail.category as Category;
            setCategories((prev) =>
              prev.map((c) =>
                c.id === full.id ? { ...c, services: full.services } : c,
              ),
            );
            if (svcSlug && full.services) {
              const svc = full.services.find((s) => s.slug === svcSlug);
              if (svc) setServiceId(svc.id);
            }
          });
      });
  }, [searchParams]);

  useEffect(() => {
    if (!categoryId) return;
    const cat = categories.find((c) => c.id === categoryId);
    if (cat?.services) return;
    if (!cat?.slug) return;

    fetch(`/api/categories/${cat.slug}`)
      .then((r) => r.json())
      .then((data) => {
        const full = data.category as Category;
        setCategories((prev) =>
          prev.map((c) =>
            c.id === full.id ? { ...c, services: full.services } : c,
          ),
        );
      });
  }, [categoryId, categories]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const services = selectedCategory?.services ?? [];
  const selectedService = services.find((s) => s.id === serviceId);
  const visibleCategories = categories.slice(0, 9);
  const targetProviderId = searchParams.get("provider") ?? "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (currentStep < 4) {
      goNext();
      return;
    }

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        categoryId,
        serviceId: serviceId || undefined,
        description,
        city,
        district: district || undefined,
        neighborhood: neighborhood || undefined,
        addressDetail: addressDetail || undefined,
        latitude,
        longitude,
        preferredDate: preferredDate || undefined,
        preferredTime: preferredTime || undefined,
        targetProviderId: targetProviderId || undefined,
        urgency,
      }),
    );
    images.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Talep oluşturulamadı");
        return;
      }
      setPublished(true);
      router.push(`${ROUTES.customer.requests}/${data.request.id}`);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  function goNext() {
    setError("");

    if (currentStep === 1 && !categoryId) {
      setError("Devam etmek için bir hizmet kategorisi seçin.");
      return;
    }

    if (currentStep === 2 && services.length > 0 && !serviceId) {
      setError("Devam etmek için hizmet detayını seçin.");
      return;
    }

    if (currentStep === 3 && description.trim().length < 10) {
      setError("Açıklama en az 10 karakter olmalı.");
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 4));
  }

  function goBack() {
    setError("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  function handleImageSelect(fileList: FileList | null, append = false) {
    const selected = Array.from(fileList ?? []).filter((file) =>
      ["image/jpeg", "image/png", "image/webp"].includes(file.type),
    );
    if (selected.length === 0) return;

    setError("");
    setImageLoading(true);

    const previews = selected.map((file) => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    window.setTimeout(() => {
      setImages((prev) => (append ? [...prev, ...selected] : selected));
      setImagePreviews((prev) => {
        if (!append) {
          prev.forEach((preview) => URL.revokeObjectURL(preview.url));
          return previews;
        }
        return [...prev, ...previews];
      });
      setImageLoading(false);
    }, 450);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.url);
      return prev.filter((_, i) => i !== index);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {targetProviderId ? (
        <div className="rounded-xl border border-[#087a61]/20 bg-[#eef8f5] px-4 py-3 text-sm text-[#083228]">
          <span className="font-black">Seçili ustaya özel talep</span>
          <span className="text-[#53635f]">
            {" "}
            — Bu talep doğrudan ilgili ustaya iletilecek.
          </span>
        </div>
      ) : null}

      <ProgressHeader currentStep={currentStep} />

      <div>
        {currentStep === 1 ? (
        <Panel title="Hizmet Kategorisi" subtitle="Hangi konuda destek almak istiyorsunuz?">
          <div className="grid grid-cols-2 gap-3">
            {visibleCategories.map((category, index) => {
              const Icon = categoryIcon(category.name, index);
              const active = category.id === categoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setCategoryId(category.id);
                    setServiceId("");
                  }}
                  className={[
                    "rounded-2xl border p-4 text-center transition hover:border-[#087a61]/40 hover:bg-[#eef8f5] hover:shadow-[0_8px_24px_rgba(8,122,97,0.08)]",
                    active
                      ? "border-[#087a61] bg-[#eef8f5] shadow-[0_8px_24px_rgba(8,122,97,0.1)]"
                      : "border-black/5 bg-white",
                  ].join(" ")}
                >
                  <Icon className="mx-auto h-7 w-7 text-[#087a61]" />
                  <p className="mt-3 text-sm font-black text-[#083228]">
                    {category.name}
                  </p>
                  <p className="mt-1 line-clamp-1 text-[11px] text-[#53635f]">
                    Bakım, onarım, montaj
                  </p>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-[#eef8f5] p-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-[#087a61]" />
              <div>
                <p className="text-sm font-black text-[#083228]">
                  Güvenilir ustalarla çalışın
                </p>
                <p className="mt-1 text-xs leading-5 text-[#53635f]">
                  Tüm ustalarımız deneyimli ve yorumlanmıştır.
                </p>
              </div>
            </div>
          </div>
        </Panel>
        ) : null}

        {currentStep === 2 ? (
        <Panel title="Hizmet Detayı" subtitle="Seçtiğiniz hizmeti belirtin.">
          <div className="mb-3 flex items-center gap-1 text-xs font-bold text-[#087a61]">
            {selectedCategory?.name ?? "Kategori seçin"}
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
          <h3 className="mb-4 text-2xl font-black text-[#083228]">
            {selectedCategory?.name ?? "Hizmet"}
          </h3>
          <div className="space-y-3">
            {(services.length > 0
              ? services
              : [{ id: "", name: "Diğer", slug: "diger" }]
            ).map((service, index) => {
              const active = service.id === serviceId || (!serviceId && index === 0);
              return (
                <button
                  key={service.id || service.slug}
                  type="button"
                  disabled={!categoryId}
                  onClick={() => setServiceId(service.id)}
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 hover:shadow-[0_8px_24px_rgba(8,122,97,0.06)]",
                    active && categoryId
                      ? "border-[#087a61] bg-[#eef8f5]"
                      : "border-black/5 bg-white hover:border-[#087a61]/40",
                  ].join(" ")}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#eef8f5] text-[#087a61]">
                    <Bolt className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-[#083228]">{service.name}</p>
                    <p className="mt-0.5 text-xs text-[#53635f]">
                      Fiyat, sigorta, kablo, anahtar arızaları
                    </p>
                  </div>
                  <span
                    className={[
                      "grid h-5 w-5 place-items-center rounded-full border",
                      active && categoryId
                        ? "border-[#087a61] bg-[#087a61] text-white"
                        : "border-black/10",
                    ].join(" ")}
                  >
                    {active && categoryId ? <Check className="h-3 w-3" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </Panel>
        ) : null}

        {currentStep === 3 ? (
        <Panel title="Detaylar" subtitle="Talebinizle ilgili detayları paylaşın.">
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#083228]">
                Başlık
              </label>
              <input
                className={fieldClass}
                placeholder="Örn. Salon prizlerinde elektrik gelmiyor"
                value={selectedService?.name ?? selectedCategory?.name ?? ""}
                readOnly
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#083228]">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                minLength={10}
                rows={6}
                className={fieldClass}
                placeholder="Yaşadığınız sorunu detaylıca yazın..."
              />
              <p className="mt-1 text-right text-[11px] text-[#7b8b87]">
                {description.length}/500
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#083228]">
                Fotoğraf Ekle{" "}
                <span className="font-semibold text-[#7b8b87]">(isteğe bağlı)</span>
              </label>
              <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#b9d9cf] bg-[#eef8f5] px-4 py-5 text-center">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    handleImageSelect(e.target.files);
                    e.target.value = "";
                  }}
                  className="hidden"
                />
                {imageLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-[#087a61]" />
                )}
                <p className="mt-2 text-sm font-black text-[#087a61]">
                  {imageLoading ? "Fotoğraflar yükleniyor..." : "Fotoğraf yükleyin"}
                </p>
                <p className="mt-1 text-xs text-[#53635f]">
                  veya sürükleyip bırakın
                </p>
                <p className="mt-1 text-[11px] text-[#7b8b87]">
                  PNG, JPG (Maks. 10MB)
                </p>
              </label>
              {imagePreviews.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div
                      key={`${preview.name}-${preview.url}`}
                      className="group relative h-16 w-16 overflow-hidden rounded-lg border border-black/5 bg-[#f7f7f3]"
                      title={preview.name}
                    >
                      <div
                        className="h-full w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${preview.url})` }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/55 text-white opacity-0 transition group-hover:opacity-100"
                        aria-label="Fotoğrafı kaldır"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <label className="grid h-14 w-14 cursor-pointer place-items-center rounded-lg border border-dashed border-black/10 text-[#53635f]">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => {
                        handleImageSelect(e.target.files, true);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    {imageLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </label>
                </div>
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs font-black text-[#083228]">
                Aciliyet Durumu
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ["normal", "Normal", "Esnek zaman"],
                  ["rush", "İvedi", "En kısa zamanda"],
                  ["urgent", "Acil", "Hemen gelsin"],
                ].map(([value, label, desc]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUrgency(value as typeof urgency)}
                    className={[
                      "rounded-xl border px-2 py-3 text-center transition",
                      urgency === value
                        ? "border-[#087a61] bg-[#eef8f5]"
                        : "border-black/5 bg-white hover:border-[#087a61]/30",
                    ].join(" ")}
                  >
                    <p
                      className={cn(
                        "text-xs font-black",
                        urgency === value ? "text-[#087a61]" : "text-[#083228]",
                      )}
                    >
                      {label}
                    </p>
                    <p className="mt-1 text-[10px] text-[#53635f]">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Panel>
        ) : null}

        {currentStep === 4 ? (
        <Panel title="Konum ve Zaman" subtitle="Nerede ve ne zaman hizmet almak istersiniz?">
          <div className="space-y-4">
            <CityDistrictSelect
              city={city}
              district={district}
              labelClassName="mb-1.5 block text-xs font-black text-[#083228]"
              selectClassName={fieldClass}
              cityLabel="Şehir"
              districtLabel="İlçe"
              onChange={({ city: c, district: d, lat, lng }) => {
                setCity(c);
                setDistrict(d);
                setLatitude(lat);
                setLongitude(lng);
              }}
            />
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#083228]">
                Adres
              </label>
              <input
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                className={fieldClass}
                placeholder="Cadde/sokak, bina, daire"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-black text-[#083228]">
                Mahalle
              </label>
              <input
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className={fieldClass}
                placeholder="Mahalle"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs font-black text-[#083228]">Konum</p>
              <LocationMap
                latitude={latitude}
                longitude={longitude}
                heightClass="h-[120px]"
                zoom={13}
                onChange={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
              />
            </div>
            <PreferredScheduleSection
              preferredDate={preferredDate}
              preferredTime={preferredTime}
              onDateChange={setPreferredDate}
              onTimeChange={setPreferredTime}
              fieldClass={fieldClass}
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#087a61] font-black hover:bg-[#06644f]"
            >
              {loading ? "Yayınlanıyor..." : "Talebi Yayınla"}
            </Button>
          </div>
          <SuccessPreview published={published} />
        </Panel>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 1 || loading}
            className="h-11 rounded-xl border-[#d7e5e1] px-5 text-[#087a61] hover:bg-[#eef8f5]"
          >
            Geri
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={goNext}
              className="h-11 rounded-xl bg-[#087a61] px-6 font-black hover:bg-[#06644f]"
            >
              Devam Et
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

const PROGRESS_STEPS = [
  "Hizmet Seçimi",
  "Hizmet Detayı",
  "Detaylar",
  "Konum ve Zaman",
] as const;

const TIME_SLOTS = [
  {
    value: "09:00 - 12:00",
    label: "Sabah",
    desc: "Usta genellikle 09:00 ile 12:00 arasında gelir.",
  },
  {
    value: "12:00 - 15:00",
    label: "Öğle",
    desc: "Usta genellikle 12:00 ile 15:00 arasında gelir.",
  },
  {
    value: "15:00 - 18:00",
    label: "Öğleden sonra",
    desc: "Usta genellikle 15:00 ile 18:00 arasında gelir.",
  },
  {
    value: "18:00 - 21:00",
    label: "Akşam",
    desc: "Usta genellikle 18:00 ile 21:00 arasında gelir.",
  },
] as const;

function todayMinDate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 flex items-start gap-1.5 text-xs leading-5 text-[#53635f]">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#087a61]" />
      <span>{children}</span>
    </p>
  );
}

function PreferredScheduleSection({
  preferredDate,
  preferredTime,
  onDateChange,
  onTimeChange,
  fieldClass,
}: {
  preferredDate: string;
  preferredTime: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  fieldClass: string;
}) {
  const selectedSlot = TIME_SLOTS.find((slot) => slot.value === preferredTime);

  return (
    <div className="rounded-2xl border border-[#087a61]/15 bg-[#eef8f5] p-4 sm:p-5">
      <div className="mb-5 flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#087a61]/10 text-[#087a61]">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-black text-[#083228]">Hizmet zamanı tercihi</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-[#087a61]">
              İsteğe bağlı
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-[#53635f]">
            Ustaların size uygun teklif verebilmesi için hizmetin hangi gün ve hangi
            saat diliminde yapılmasını istediğinizi belirtebilirsiniz. Bu bilgiler
            kesin randevu değildir; teklif kabulünden sonra usta ile netleştirilir.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="preferred-date"
            className="mb-1 block text-xs font-black text-[#083228]"
          >
            Tercih ettiğiniz gün
          </label>
          <FieldHint>
            Hizmetin yapılmasını istediğiniz tarihi seçin. Bugünden önceki bir tarih
            seçilemez. Emin değilseniz boş bırakabilirsiniz; usta teklifinde farklı
            günler önerebilir.
          </FieldHint>
          <input
            id="preferred-date"
            type="date"
            min={todayMinDate()}
            value={preferredDate}
            onChange={(e) => onDateChange(e.target.value)}
            className={fieldClass}
          />
          {preferredDate ? (
            <p className="mt-2 text-[11px] font-semibold text-[#087a61]">
              Seçilen gün:{" "}
              {new Date(`${preferredDate}T12:00:00`).toLocaleDateString("tr-TR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-[#7b8b87]">
              Tarih seçilmedi — usta ile teklif sonrası gün belirlenebilir.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="preferred-time"
            className="mb-1 block text-xs font-black text-[#083228]"
          >
            Tercih ettiğiniz saat aralığı
          </label>
          <FieldHint>
            Ustanın evinize gelmesini istediğiniz zaman dilimini seçin. Bu, o gün
            içindeki yaklaşık bir aralıktır; usta trafik ve iş yoğunluğuna göre
            teklifinde net saat belirtebilir.
          </FieldHint>
          <select
            id="preferred-time"
            value={preferredTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className={fieldClass}
          >
            <option value="">Belirtmek istemiyorum</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot.value} value={slot.value}>
                {slot.label} ({slot.value})
              </option>
            ))}
          </select>

          {selectedSlot ? (
            <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-[#53635f]">
              <span className="font-black text-[#083228]">{selectedSlot.label}:</span>{" "}
              {selectedSlot.desc}
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 rounded-lg bg-white/80 px-3 py-2.5 text-[11px] leading-5 text-[#53635f]">
              <li>
                <span className="font-bold text-[#083228]">Sabah (09:00–12:00):</span>{" "}
                Erken saatlerde gelmesini isteyenler için.
              </li>
              <li>
                <span className="font-bold text-[#083228]">Öğle (12:00–15:00):</span>{" "}
                Öğle saatlerinde uygun olanlar için.
              </li>
              <li>
                <span className="font-bold text-[#083228]">Öğleden sonra (15:00–18:00):</span>{" "}
                İş çıkışı öncesi veya gün ortası için.
              </li>
              <li>
                <span className="font-bold text-[#083228]">Akşam (18:00–21:00):</span>{" "}
                Mesai sonrası veya akşam saatleri için.
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressHeader({ currentStep }: { currentStep: number }) {
  return (
    <>
      <div className="rounded-2xl border border-black/5 bg-white px-4 py-3 md:hidden">
        <p className="text-[11px] font-bold uppercase tracking-wide text-[#7b8b87]">
          Adım {currentStep} / 4
        </p>
        <p className="mt-0.5 text-sm font-black text-[#083228]">
          {PROGRESS_STEPS[currentStep - 1]}
        </p>
      </div>

      <div className="hidden items-center md:flex">
        {PROGRESS_STEPS.map((label, index) => {
          const stepNum = index + 1;
          const completed = stepNum < currentStep;
          const active = stepNum === currentStep;

          return (
            <div key={label} className="flex flex-1 items-center">
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black transition",
                    completed && "bg-[#087a61] text-white",
                    active && !completed && "bg-[#087a61] text-white ring-4 ring-[#087a61]/15",
                    !completed &&
                      !active &&
                      "border border-black/10 bg-white text-[#7b8b87]",
                  )}
                >
                  {completed ? <Check className="h-4 w-4" /> : stepNum}
                </span>
                <span
                  className={cn(
                    "truncate text-xs font-black",
                    active ? "text-[#083228]" : "text-[#7b8b87]",
                  )}
                >
                  {label}
                </span>
              </div>
              {index < PROGRESS_STEPS.length - 1 ? (
                <div
                  className={cn(
                    "mx-3 h-px flex-1",
                    stepNum < currentStep ? "bg-[#087a61]/40" : "bg-black/10",
                  )}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-6 border-b border-black/5 pb-5">
        <h2 className="text-lg font-black text-[#083228]">{title}</h2>
        <p className="mt-1 text-sm text-[#53635f]">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SuccessPreview({ published }: { published: boolean }) {
  return (
    <div className="mt-6 rounded-2xl border border-[#087a61]/15 bg-[#eef8f5] p-5 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#087a61] text-white">
        <Check className="h-7 w-7" />
      </div>
      <h3 className="mt-3 font-black text-[#083228]">
        {published ? "Talebiniz Yayınlandı!" : "Talebiniz Yayınlanacak"}
      </h3>
      <p className="mt-2 text-xs leading-5 text-[#53635f]">
        Ustalar talebinizi görüyor ve size teklif vermeye başlayacak.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] text-[#53635f]">
        <MiniStat icon={<Home className="h-3.5 w-3.5" />} title="Teklif süresi" text="5 - 15 dk" />
        <MiniStat icon={<Sparkles className="h-3.5 w-3.5" />} title="Teklif sayısı" text="4 - 6 teklif" />
        <MiniStat icon={<ShieldCheck className="h-3.5 w-3.5" />} title="Bildirim" text="SMS & E-posta" />
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg bg-white p-2">
      <div className="mx-auto mb-1 grid h-6 w-6 place-items-center rounded-full bg-[#eef8f5] text-[#087a61]">
        {icon}
      </div>
      <p className="font-bold text-[#083228]">{title}</p>
      <p className="mt-1 text-[#53635f]">{text}</p>
    </div>
  );
}

