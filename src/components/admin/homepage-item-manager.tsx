"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { HomepageItemType } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { HOMEPAGE_ICON_OPTIONS } from "@/lib/homepage/icons";
import { ROUTES } from "@/lib/constants";
import type { HomepageItemData } from "@/lib/homepage/defaults";
import type { HomepagePickerOption } from "@/lib/homepage/get-homepage-content";

type Props = {
  type: HomepageItemType;
  items: HomepageItemData[];
  pickers?: HomepagePickerOption;
  labels: {
    create: string;
    title?: string;
    subtitle?: string;
    description?: string;
    body?: string;
    priceLabel?: string;
    stepNumber?: string;
  };
  showIcon?: boolean;
  showHref?: boolean;
  showPrice?: boolean;
  showRating?: boolean;
  showStepNumber?: boolean;
  showFeaturedPickers?: boolean;
  /** Otomatik önizleme kartları (ör. dynamic-category-*) düzenlenemez */
  readOnlyIdsPrefix?: string;
};

export function HomepageItemManager({
  type,
  items,
  labels,
  showIcon = false,
  showHref = false,
  showPrice = false,
  showRating = false,
  showStepNumber = false,
  pickers,
  showFeaturedPickers = false,
  readOnlyIdsPrefix,
}: Props) {
  const router = useRouter();
  const filtered = items.filter((i) => i.type === type);

  function isReadOnly(id: string) {
    if (id.startsWith("default-")) return true;
    if (readOnlyIdsPrefix && id.startsWith(readOnlyIdsPrefix)) return true;
    return false;
  }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    body: "",
    priceLabel: "",
    icon: "Wrench",
    href: "/hizmetler",
    stepNumber: "1",
    rating: "5",
    serviceId: "",
    listingId: "",
    imageUrl: "",
  });

  function applyListingSelection(listingId: string) {
    const listing = pickers?.listings.find((l) => l.id === listingId);
    setForm((f) => ({
      ...f,
      listingId,
      serviceId: "",
      href: listingId ? `${ROUTES.listings}/${listingId}` : f.href,
      title: listing && !f.title ? listing.title : f.title,
      subtitle: listing && !f.subtitle ? listing.categoryName : f.subtitle,
      priceLabel:
        listing && !f.priceLabel
          ? `Başlayan ${listing.price.toLocaleString("tr-TR")} ₺`
          : f.priceLabel,
    }));
  }

  function applyServiceSelection(serviceId: string) {
    const service = pickers?.services.find((s) => s.id === serviceId);
    setForm((f) => ({
      ...f,
      serviceId,
      listingId: "",
      href: service
        ? `${ROUTES.categories}/${service.categorySlug}`
        : f.href,
      title: service && !f.title ? service.name : f.title,
      subtitle: service && !f.subtitle ? service.categoryName : f.subtitle,
    }));
  }

  async function createItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    let title = form.title.trim();
    if (!title && form.listingId) {
      title =
        pickers?.listings.find((l) => l.id === form.listingId)?.title ?? "";
    }
    if (!title && form.serviceId) {
      title =
        pickers?.services.find((s) => s.id === form.serviceId)?.name ?? "";
    }
    if (!title) {
      setError("Başlık girin veya ilan/hizmet seçin");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/homepage/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          subtitle: form.subtitle || null,
          description: form.description || null,
          body: form.body || null,
          priceLabel: form.priceLabel || null,
          icon: showIcon ? form.icon : null,
          href: showHref ? form.href : null,
          stepNumber: showStepNumber ? form.stepNumber : null,
          rating: showRating ? Number(form.rating) : null,
          serviceId: form.serviceId || null,
          listingId: form.listingId || null,
          imageUrl: form.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }
      setForm({
        title: "",
        subtitle: "",
        description: "",
        body: "",
        priceLabel: "",
        icon: "Wrench",
        href: "/hizmetler",
        stepNumber: "1",
        rating: "5",
        serviceId: "",
        listingId: "",
        imageUrl: "",
      });
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function patchItem(
    id: string,
    patch: Partial<HomepageItemData> & { isActive?: boolean },
  ) {
    if (isReadOnly(id)) return;
    await fetch(`/api/admin/homepage/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    router.refresh();
  }

  async function remove(id: string) {
    if (isReadOnly(id)) return;
    if (!confirm("Bu öğe silinsin mi?")) return;
    await fetch(`/api/admin/homepage/items/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <form
        onSubmit={createItem}
        className="space-y-3 rounded-2xl border border-black/5 bg-white p-6"
      >
        <p className="text-sm font-black text-[#083228]">{labels.create}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {labels.title ? (
            <Field label={labels.title}>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className={inputClass}
              />
            </Field>
          ) : null}
          {labels.subtitle ? (
            <Field label={labels.subtitle}>
              <input
                value={form.subtitle}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subtitle: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
          ) : null}
          {showStepNumber ? (
            <Field label={labels.stepNumber ?? "Adım no"}>
              <input
                value={form.stepNumber}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stepNumber: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
          ) : null}
          {labels.description ? (
            <Field label={labels.description} className="sm:col-span-2">
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
                className={inputClass}
              />
            </Field>
          ) : null}
          {labels.body ? (
            <Field label={labels.body} className="sm:col-span-2">
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                required
                rows={3}
                className={inputClass}
              />
            </Field>
          ) : null}
          {showPrice ? (
            <Field label={labels.priceLabel ?? "Fiyat etiketi"}>
              <input
                value={form.priceLabel}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceLabel: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
          ) : null}
          {showIcon ? (
            <Field label="İkon">
              <select
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className={inputClass}
              >
                {HOMEPAGE_ICON_OPTIONS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
          {showFeaturedPickers && pickers ? (
            <>
              <Field label="İlan bağla (görsel + fiyat dinamik)">
                <select
                  value={form.listingId}
                  onChange={(e) => applyListingSelection(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Manuel / kategori linki —</option>
                  {pickers.listings.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} · {l.categoryName}
                      {l.imageUrl ? " · görsel var" : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Hizmet bağla (kategori kapağı)">
                <select
                  value={form.serviceId}
                  onChange={(e) => applyServiceSelection(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— Seçilmedi —</option>
                  {pickers.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.categoryName})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Özel kapak URL (isteğe bağlı)">
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="https://..."
                />
              </Field>
            </>
          ) : null}
          {showHref ? (
            <Field label="Link">
              <input
                value={form.href}
                onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
                className={inputClass}
                placeholder="/hizmetler/kategori-slug veya /ilanlar/id"
              />
              {type === "FEATURED_SERVICE" ? (
                <p className="mt-1 text-[11px] text-[#53635f]">
                  İlan seçilirse link otomatik <code>/ilanlar/…</code> olur.
                  Kategori linki (<code>/hizmetler/slug</code>) veya hizmet
                  seçimi ile kategori kapağı kullanılır.
                </p>
              ) : null}
            </Field>
          ) : null}
          {showRating ? (
            <Field label="Puan (1-5)">
              <select
                value={form.rating}
                onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                className={inputClass}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
        <Button type="submit" disabled={loading} className="h-10">
          Ekle
        </Button>
      </form>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-3"
          >
            <div className="min-w-0 text-sm">
              <span className="font-bold text-[#083228]">
                {item.title ?? item.stepNumber ?? "—"}
              </span>
              {item.subtitle ? (
                <span className="text-[#53635f]"> · {item.subtitle}</span>
              ) : null}
              {item.listingId ? (
                <span className="ml-2 text-xs text-[#087a61]">ilan</span>
              ) : null}
              {item.serviceId ? (
                <span className="ml-2 text-xs text-[#087a61]">hizmet</span>
              ) : null}
              {!item.isActive ? (
                <span className="ml-2 text-xs font-bold text-amber-700">
                  (pasif)
                </span>
              ) : null}
              {isReadOnly(item.id) ? (
                <span className="ml-2 text-xs font-bold text-[#087a61]">
                  (otomatik önizleme)
                </span>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs"
                disabled={isReadOnly(item.id)}
                onClick={() =>
                  patchItem(item.id, { isActive: !item.isActive })
                }
              >
                {item.isActive ? "Gizle" : "Göster"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 text-xs text-red-700"
                disabled={isReadOnly(item.id)}
                onClick={() => remove(item.id)}
              >
                Sil
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 px-3 py-2 text-sm";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-1 block text-xs font-bold text-[#53635f]">{label}</span>
      {children}
    </label>
  );
}
