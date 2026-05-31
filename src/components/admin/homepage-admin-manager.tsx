"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HomepageItemManager } from "@/components/admin/homepage-item-manager";
import type { HomepageConfigData, HomepageItemData } from "@/lib/homepage/defaults";
import type { HomepagePickerOption } from "@/lib/homepage/get-homepage-content";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "hero", label: "Hero" },
  { id: "services", label: "Popüler Hizmetler" },
  { id: "sections", label: "Bölüm Metinleri" },
  { id: "stats", label: "İstatistikler" },
  { id: "testimonials", label: "Vitrin Yorumları" },
  { id: "steps", label: "Nasıl Çalışır" },
  { id: "visibility", label: "Görünürlük" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function HomepageAdminManager({
  initialConfig,
  initialItems,
  pickers,
  manualFeatured,
}: {
  initialConfig: HomepageConfigData;
  initialItems: HomepageItemData[];
  pickers: HomepagePickerOption;
  manualFeatured: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("hero");
  const [config, setConfig] = useState(initialConfig);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resettingFeatured, setResettingFeatured] = useState(false);
  const [uploading, setUploading] = useState<"hero" | "mobile" | null>(null);

  async function saveConfig(patch: Partial<HomepageConfigData>) {
    setLoading(true);
    const next = { ...config, ...patch };
    const res = await fetch("/api/admin/homepage/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setLoading(false);
    if (res.ok) {
      setConfig(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await saveConfig(config);
  }

  async function uploadImage(kind: "hero" | "mobile", file: File) {
    setUploading(kind);
    const form = new FormData();
    form.append("file", file);
    form.append("kind", kind);
    const res = await fetch("/api/admin/homepage/upload", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setUploading(null);
    if (res.ok && data.url) {
      const key = kind === "hero" ? "heroImageUrl" : "mobileImageUrl";
      await saveConfig({ [key]: data.url });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-bold transition",
              tab === t.id
                ? "bg-[#087a61] text-white"
                : "bg-[#f8fcfa] text-[#53635f] hover:bg-[#eef8f5]",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {saved ? (
        <p className="text-sm font-bold text-[#087a61]">Kaydedildi</p>
      ) : null}

      {tab === "hero" ? (
        <ConfigForm onSubmit={handleSubmit}>
          <TextField
            label="Rozet metni"
            value={config.heroBadge}
            onChange={(v) => setConfig((c) => ({ ...c, heroBadge: v }))}
          />
          <TextArea
            label="Başlık (her satır ayrı)"
            value={config.heroTitle}
            onChange={(v) => setConfig((c) => ({ ...c, heroTitle: v }))}
            rows={5}
          />
          <TextArea
            label="Alt metin"
            value={config.heroSubtitle}
            onChange={(v) => setConfig((c) => ({ ...c, heroSubtitle: v }))}
          />
          <TextField
            label="Arama placeholder"
            value={config.heroSearchPlaceholder}
            onChange={(v) =>
              setConfig((c) => ({ ...c, heroSearchPlaceholder: v }))
            }
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Puan kartı"
              value={config.heroRating}
              onChange={(v) => setConfig((c) => ({ ...c, heroRating: v }))}
            />
            <TextField
              label="Puan alt metni"
              value={config.heroRatingLabel}
              onChange={(v) =>
                setConfig((c) => ({ ...c, heroRatingLabel: v }))
              }
            />
          </div>
          <ImageField
            label="Hero görsel URL"
            value={config.heroImageUrl}
            onChange={(v) => setConfig((c) => ({ ...c, heroImageUrl: v }))}
            uploading={uploading === "hero"}
            onUpload={(f) => uploadImage("hero", f)}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Birincil CTA"
              value={config.heroPrimaryCtaLabel}
              onChange={(v) =>
                setConfig((c) => ({ ...c, heroPrimaryCtaLabel: v }))
              }
            />
            <TextField
              label="Birincil CTA link"
              value={config.heroPrimaryCtaHref}
              onChange={(v) =>
                setConfig((c) => ({ ...c, heroPrimaryCtaHref: v }))
              }
            />
            <TextField
              label="İkincil CTA"
              value={config.heroSecondaryCtaLabel}
              onChange={(v) =>
                setConfig((c) => ({ ...c, heroSecondaryCtaLabel: v }))
              }
            />
            <TextField
              label="İkincil CTA link"
              value={config.heroSecondaryCtaHref}
              onChange={(v) =>
                setConfig((c) => ({ ...c, heroSecondaryCtaHref: v }))
              }
            />
          </div>
          <SaveButton loading={loading} />
        </ConfigForm>
      ) : null}

      {tab === "services" ? (
        <div className="space-y-4">
          {manualFeatured ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-[#53635f]">
              <p className="font-bold text-[#083228]">Manuel mod</p>
              <p className="mt-1">
                Aşağıdaki kartlar anasayfada gösterilir. Otomatik kategori
                listesine dönmek için tüm manuel kartları silin.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-9 text-xs"
                disabled={resettingFeatured}
                onClick={async () => {
                  if (
                    !confirm(
                      "Tüm manuel popüler hizmet kartları silinsin mi? Anasayfa aktif kategorilerden otomatik üretilecek.",
                    )
                  ) {
                    return;
                  }
                  setResettingFeatured(true);
                  const res = await fetch(
                    "/api/admin/homepage/featured/reset",
                    { method: "POST" },
                  );
                  setResettingFeatured(false);
                  if (res.ok) router.refresh();
                }}
              >
                {resettingFeatured
                  ? "Siliniyor…"
                  : "Otomatik moda dön (tüm kartları sil)"}
              </Button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#087a61]/20 bg-[#f8fcfa] p-4 text-sm text-[#53635f]">
              <p className="font-bold text-[#083228]">Otomatik mod</p>
              <p className="mt-1">
                Kartlar aktif kategorilerden üretilir (kapak görseli ve aktif
                ilan sayısına göre sıralanır). Kategori kapakları ve en düşük
                ilan fiyatı otomatik kullanılır.
              </p>
              <p className="mt-2 text-xs">
                Kart sayısı: Bölüm Metinleri → &quot;Gösterilecek popüler hizmet
                sayısı&quot;. Manuel kart ekleyerek özelleştirebilirsiniz.
              </p>
            </div>
          )}
          <HomepageItemManager
            type="FEATURED_SERVICE"
            items={initialItems}
            pickers={pickers}
            readOnlyIdsPrefix="dynamic-category-"
            labels={{
              create: "Manuel popüler hizmet kartı ekle",
              title: "Başlık (boş bırakılırsa ilan/hizmetten alınır)",
              subtitle: "Rozet (ör. kategori adı)",
              description: "Açıklama",
              priceLabel:
                "Fiyat etiketi (boş bırakın — kategorideki en düşük ilan fiyatı kullanılır)",
            }}
            showIcon
            showHref
            showPrice
            showFeaturedPickers
          />
        </div>
      ) : null}

      {tab === "sections" ? (
        <ConfigForm onSubmit={handleSubmit}>
          <SectionBlock title="Popüler Hizmetler">
            <SectionFields
              config={config}
              setConfig={setConfig}
              prefix="popularServices"
            />
            <TextField
              label="Gösterilecek popüler hizmet sayısı (otomatik mod)"
              type="number"
              value={String(config.popularServicesLimit)}
              onChange={(v) =>
                setConfig((c) => ({
                  ...c,
                  popularServicesLimit: Math.max(1, Math.min(24, Number(v) || 8)),
                }))
              }
            />
          </SectionBlock>
          <SectionBlock title="Kategoriler">
            <SectionFields
              config={config}
              setConfig={setConfig}
              prefix="categories"
            />
            <TextField
              label="Gösterilecek kategori sayısı"
              type="number"
              value={String(config.categoriesLimit)}
              onChange={(v) =>
                setConfig((c) => ({
                  ...c,
                  categoriesLimit: Math.max(1, Number(v) || 8),
                }))
              }
            />
          </SectionBlock>
          <SectionBlock title="Güvence bandı">
            <TextField
              label="Başlık"
              value={config.guaranteeTitle}
              onChange={(v) => setConfig((c) => ({ ...c, guaranteeTitle: v }))}
            />
            <TextArea
              label="Metin"
              value={config.guaranteeText}
              onChange={(v) => setConfig((c) => ({ ...c, guaranteeText: v }))}
            />
          </SectionBlock>
          <SectionBlock title="Yorumlar">
            <SectionFields
              config={config}
              setConfig={setConfig}
              prefix="reviews"
            />
          </SectionBlock>
          <SectionBlock title="Nasıl Çalışır">
            <SectionFields
              config={config}
              setConfig={setConfig}
              prefix="howItWorks"
            />
          </SectionBlock>
          <SectionBlock title="Mobil uygulama">
            <TextArea
              label="Başlık (satır kırılımı için Enter)"
              value={config.mobileTitle}
              onChange={(v) => setConfig((c) => ({ ...c, mobileTitle: v }))}
              rows={3}
            />
            <TextArea
              label="Metin"
              value={config.mobileText}
              onChange={(v) => setConfig((c) => ({ ...c, mobileText: v }))}
            />
            <ImageField
              label="Mobil görsel URL"
              value={config.mobileImageUrl}
              onChange={(v) => setConfig((c) => ({ ...c, mobileImageUrl: v }))}
              uploading={uploading === "mobile"}
              onUpload={(f) => uploadImage("mobile", f)}
            />
          </SectionBlock>
          <SectionBlock title="Alt CTA">
            <TextField
              label="Rozet"
              value={config.ctaEyebrow}
              onChange={(v) => setConfig((c) => ({ ...c, ctaEyebrow: v }))}
            />
            <TextField
              label="Başlık"
              value={config.ctaTitle}
              onChange={(v) => setConfig((c) => ({ ...c, ctaTitle: v }))}
            />
            <TextArea
              label="Metin"
              value={config.ctaText}
              onChange={(v) => setConfig((c) => ({ ...c, ctaText: v }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <TextField
                label="Birincil buton"
                value={config.ctaPrimaryLabel}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, ctaPrimaryLabel: v }))
                }
              />
              <TextField
                label="Birincil link"
                value={config.ctaPrimaryHref}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, ctaPrimaryHref: v }))
                }
              />
              <TextField
                label="İkincil buton"
                value={config.ctaSecondaryLabel}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, ctaSecondaryLabel: v }))
                }
              />
              <TextField
                label="İkincil link"
                value={config.ctaSecondaryHref}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, ctaSecondaryHref: v }))
                }
              />
            </div>
          </SectionBlock>
          <SaveButton loading={loading} />
        </ConfigForm>
      ) : null}

      {tab === "stats" ? (
        <HomepageItemManager
          type="STAT"
          items={initialItems}
          labels={{
            create: "Yeni istatistik",
            title: "Değer (örn. 1M+)",
            subtitle: "Etiket",
          }}
        />
      ) : null}

      {tab === "testimonials" ? (
        <HomepageItemManager
          type="TESTIMONIAL"
          items={initialItems}
          labels={{
            create: "Yeni vitrin yorumu",
            title: "İsim",
            subtitle: "Hizmet adı",
            body: "Yorum metni",
          }}
          showRating
        />
      ) : null}

      {tab === "steps" ? (
        <HomepageItemManager
          type="HOW_IT_WORKS_STEP"
          items={initialItems}
          labels={{
            create: "Yeni adım",
            title: "Başlık",
            description: "Kısa açıklama",
            stepNumber: "Adım numarası",
          }}
          showIcon
          showStepNumber
        />
      ) : null}

      {tab === "visibility" ? (
        <ConfigForm
          onSubmit={async (e) => {
            e.preventDefault();
            await saveConfig({
              showHero: config.showHero,
              showPopularServices: config.showPopularServices,
              showCategories: config.showCategories,
              showReviews: config.showReviews,
              showMobileBanner: config.showMobileBanner,
              showHowItWorks: config.showHowItWorks,
              showBottomCta: config.showBottomCta,
            });
          }}
        >
          <p className="text-sm text-[#53635f]">
            Kapalı bölümler ana sayfada gösterilmez.
          </p>
          {(
            [
              ["showHero", "Hero"],
              ["showPopularServices", "Popüler Hizmetler"],
              ["showCategories", "Kategoriler"],
              ["showReviews", "Vitrin Yorumları"],
              ["showMobileBanner", "Mobil Banner"],
              ["showHowItWorks", "Nasıl Çalışır"],
              ["showBottomCta", "Alt CTA"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex items-center gap-3 rounded-xl border border-black/5 bg-white px-4 py-3 text-sm font-semibold"
            >
              <input
                type="checkbox"
                checked={config[key]}
                onChange={(e) =>
                  setConfig((c) => ({ ...c, [key]: e.target.checked }))
                }
                className="h-4 w-4 accent-[#087a61]"
              />
              {label}
            </label>
          ))}
          <SaveButton loading={loading} />
        </ConfigForm>
      ) : null}
    </div>
  );
}

function ConfigForm({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="max-w-3xl space-y-4 rounded-2xl border border-black/5 bg-white p-6"
    >
      {children}
    </form>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-black/5 pt-4 first:border-0 first:pt-0">
      <h3 className="text-sm font-black text-[#083228]">{title}</h3>
      {children}
    </div>
  );
}

function SectionFields({
  config,
  setConfig,
  prefix,
}: {
  config: HomepageConfigData;
  setConfig: React.Dispatch<React.SetStateAction<HomepageConfigData>>;
  prefix: "popularServices" | "categories" | "reviews" | "howItWorks";
}) {
  const eyebrow = `${prefix}Eyebrow` as keyof HomepageConfigData;
  const title = `${prefix}Title` as keyof HomepageConfigData;
  const subtitle = `${prefix}Subtitle` as keyof HomepageConfigData;
  const ctaLabel = `${prefix}CtaLabel` as keyof HomepageConfigData;
  const ctaHref = `${prefix}CtaHref` as keyof HomepageConfigData;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        label="Üst etiket"
        value={String(config[eyebrow])}
        onChange={(v) => setConfig((c) => ({ ...c, [eyebrow]: v }))}
      />
      <TextField
        label="Başlık"
        value={String(config[title])}
        onChange={(v) => setConfig((c) => ({ ...c, [title]: v }))}
      />
      <TextArea
        label="Alt başlık"
        className="sm:col-span-2"
        value={String(config[subtitle])}
        onChange={(v) => setConfig((c) => ({ ...c, [subtitle]: v }))}
      />
      <TextField
        label="CTA metni"
        value={String(config[ctaLabel])}
        onChange={(v) => setConfig((c) => ({ ...c, [ctaLabel]: v }))}
      />
      <TextField
        label="CTA link"
        value={String(config[ctaHref])}
        onChange={(v) => setConfig((c) => ({ ...c, [ctaHref]: v }))}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-[#53635f]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-xs font-bold text-[#53635f]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
      />
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  uploading,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  uploading: boolean;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="space-y-2">
      <TextField label={label} value={value} onChange={onChange} />
      <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-[#087a61]">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
          }}
        />
        {uploading ? "Yükleniyor…" : "Dosya yükle (CDN)"}
      </label>
    </div>
  );
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="mt-2 h-10">
      {loading ? "Kaydediliyor…" : "Kaydet"}
    </Button>
  );
}
