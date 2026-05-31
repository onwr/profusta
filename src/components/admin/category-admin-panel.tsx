"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImageIcon,
  Layers,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_ICON_OPTIONS, getCategoryIcon } from "@/lib/category-icons";
import { HOMEPAGE_ICON_OPTIONS } from "@/lib/homepage/icons";

const ICON_OPTIONS = [
  ...new Set([...CATEGORY_ICON_OPTIONS, ...HOMEPAGE_ICON_OPTIONS]),
].sort();
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type CategoryAdminRow = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { services: number };
};

type FilterKey = "all" | "active" | "inactive";

type EditForm = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  coverImageUrl: string;
  sortOrder: string;
  isActive: boolean;
};

function emptyForm(): EditForm {
  return {
    name: "",
    slug: "",
    icon: "Wrench",
    description: "",
    coverImageUrl: "",
    sortOrder: "0",
    isActive: true,
  };
}

function rowToForm(cat: CategoryAdminRow): EditForm {
  return {
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon ?? "Wrench",
    description: cat.description ?? "",
    coverImageUrl: cat.coverImageUrl ?? "",
    sortOrder: String(cat.sortOrder),
    isActive: cat.isActive,
  };
}

export function CategoryAdminPanel({
  categories,
}: {
  categories: CategoryAdminRow[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState<EditForm>(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((cat) => {
      if (filter === "active" && !cat.isActive) return false;
      if (filter === "inactive" && cat.isActive) return false;
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [sorted, query, filter]);

  const stats = useMemo(
    () => ({
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
      inactive: categories.filter((c) => !c.isActive).length,
    }),
    [categories],
  );

  const duplicateNameCount = useMemo(() => {
    const seen = new Map<string, number>();
    for (const cat of categories) {
      const key = cat.name.trim().toLocaleLowerCase("tr-TR");
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    return [...seen.values()].filter((n) => n > 1).length;
  }, [categories]);

  async function runDedupe() {
    if (
      !confirm(
        "Aynı isimli yinelenen kategoriler birleştirilecek. Alt hizmetler ve ilanlar korunur. Devam?",
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories/dedupe", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Birleştirme başarısız");
        return;
      }
      const merged = data.merged as { name: string; kept: string }[] | undefined;
      if (merged?.length) {
        alert(
          `${merged.length} yinelenen grup birleştirildi:\n${merged
            .map((m) => `• ${m.name} → /${m.kept}`)
            .join("\n")}`,
        );
      } else {
        alert("Yinelenen kategori bulunamadı.");
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          slug: createForm.slug || undefined,
          icon: createForm.icon,
          description: createForm.description || undefined,
          coverImageUrl: createForm.coverImageUrl || null,
          sortOrder: Number(createForm.sortOrder) || undefined,
          isActive: createForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }
      setCreateForm(emptyForm());
      setShowCreate(false);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function saveEdit(id: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          slug: editForm.slug,
          icon: editForm.icon,
          description: editForm.description || null,
          coverImageUrl: editForm.coverImageUrl || null,
          sortOrder: Number(editForm.sortOrder),
          isActive: editForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Güncelleme başarısız");
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCover(id: string, file: File, target: "create" | "edit") {
    setUploadingId(id);
    setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`/api/admin/categories/${id}/cover`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Yükleme başarısız");
        return;
      }
      const url = data.coverImageUrl as string;
      if (target === "edit") {
        setEditForm((f) => ({ ...f, coverImageUrl: url }));
      }
      router.refresh();
    } catch {
      setError("Yükleme hatası");
    } finally {
      setUploadingId(null);
    }
  }

  async function moveOrder(id: string, direction: "up" | "down") {
    const index = sorted.findIndex((c) => c.id === id);
    if (index < 0) return;
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sorted.length) return;

    const current = sorted[index];
    const swap = sorted[swapIndex];

    await Promise.all([
      fetch(`/api/admin/categories/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: swap.sortOrder }),
      }),
      fetch(`/api/admin/categories/${swap.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sortOrder: current.sortOrder }),
      }),
    ]);
    router.refresh();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`"${name}" silinsin mi? Alt hizmetler de silinir.`)) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (editingId === id) setEditingId(null);
    router.refresh();
  }

  function startEdit(cat: CategoryAdminRow) {
    setEditingId(cat.id);
    setEditForm(rowToForm(cat));
    setShowCreate(false);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Toplam" value={stats.total} />
        <StatCard label="Aktif" value={stats.active} accent />
        <StatCard label="Pasif" value={stats.inactive} />
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa39c]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kategori ara…"
            className="h-10 w-full rounded-xl border border-black/10 bg-[#f8fcfa] pl-9 pr-3 text-sm outline-none focus:border-[#087a61]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tümü"],
              ["active", "Aktif"],
              ["inactive", "Pasif"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-bold transition",
                filter === key
                  ? "bg-[#087a61] text-white"
                  : "bg-[#f8fcfa] text-[#53635f] hover:bg-[#eef8f5]",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {duplicateNameCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 border-amber-200 text-amber-900 hover:bg-amber-50"
            disabled={loading}
            onClick={runDedupe}
          >
            Yinelenenleri birleştir ({duplicateNameCount})
          </Button>
        ) : null}
        <Button
          type="button"
          className="h-10 gap-2"
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingId(null);
          }}
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "İptal" : "Yeni kategori"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {showCreate ? (
        <CategoryForm
          title="Yeni kategori"
          form={createForm}
          setForm={setCreateForm}
          onSubmit={createCategory}
          loading={loading}
          showCoverUpload={false}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {filtered.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isEditing = editingId === cat.id;

          return (
            <article
              key={cat.id}
              className={cn(
                "overflow-hidden rounded-[20px] border bg-white shadow-sm transition",
                cat.isActive
                  ? "border-black/5"
                  : "border-amber-200/80 opacity-90",
                isEditing && "ring-2 ring-[#087a61]/30",
              )}
            >
              <div className="relative h-36 bg-linear-to-br from-[#eef8f5] to-[#d9ebe5]">
                {cat.coverImageUrl ? (
                  <Image
                    src={cat.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized={cat.coverImageUrl.startsWith("http")}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#087a61]/25">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-[#083228]/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/95 text-[#087a61] shadow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
                      cat.isActive
                        ? "bg-[#dcf7e7] text-[#066b54]"
                        : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {cat.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-black text-[#083228]">{cat.name}</h3>
                <p className="mt-1 text-xs text-[#53635f]">
                  /{cat.slug} · sıra {cat.sortOrder} · {cat._count.services}{" "}
                  alt hizmet
                </p>
                {cat.description ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#66736f]">
                    {cat.description}
                  </p>
                ) : null}

                {!isEditing ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 flex-1 gap-1 text-xs"
                      onClick={() => startEdit(cat)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-2"
                      onClick={() => moveOrder(cat.id, "up")}
                      title="Yukarı"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-2"
                      onClick={() => moveOrder(cat.id, "down")}
                      title="Aşağı"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Link
                      href={`${ROUTES.categories}/${cat.slug}`}
                      target="_blank"
                      className="inline-flex h-9 items-center justify-center rounded-xl border border-black/10 px-2 text-[#087a61] hover:bg-[#eef8f5]"
                      title="Sitede gör"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 px-2 text-red-600"
                      onClick={() => remove(cat.id, cat.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3 border-t border-black/5 pt-4">
                    <CategoryFormFields
                      form={editForm}
                      setForm={setEditForm}
                      categoryId={cat.id}
                      uploading={uploadingId === cat.id}
                      onUpload={(file) => uploadCover(cat.id, file, "edit")}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="h-9 flex-1"
                        disabled={loading}
                        onClick={() => saveEdit(cat.id)}
                      >
                        Kaydet
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9"
                        onClick={() => setEditingId(null)}
                      >
                        Vazgeç
                      </Button>
                    </div>
                    <Link
                      href={ROUTES.admin.services}
                      className="flex items-center gap-2 text-xs font-bold text-[#087a61] hover:underline"
                    >
                      <Layers className="h-3.5 w-3.5" />
                      Alt hizmetleri yönet
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5]/50 py-12 text-center text-sm text-[#53635f]">
          Eşleşen kategori yok.
        </p>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-4">
      <p className="text-xs font-bold text-[#53635f]">{label}</p>
      <p
        className={cn(
          "mt-1 text-2xl font-black",
          accent ? "text-[#087a61]" : "text-[#083228]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function CategoryForm({
  title,
  form,
  setForm,
  onSubmit,
  loading,
  showCoverUpload,
  categoryId,
  onUpload,
  uploading,
}: {
  title: string;
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  showCoverUpload: boolean;
  categoryId?: string;
  onUpload?: (file: File) => void;
  uploading?: boolean;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-black/5 bg-white p-6"
    >
      <h3 className="mb-4 text-sm font-black text-[#083228]">{title}</h3>
      <CategoryFormFields
        form={form}
        setForm={setForm}
        showCoverUpload={showCoverUpload}
        categoryId={categoryId}
        onUpload={onUpload}
        uploading={uploading}
      />
      <Button type="submit" disabled={loading} className="mt-4 h-10">
        {loading ? "Kaydediliyor…" : "Oluştur"}
      </Button>
    </form>
  );
}

function CategoryFormFields({
  form,
  setForm,
  categoryId,
  onUpload,
  uploading,
  showCoverUpload = true,
}: {
  form: EditForm;
  setForm: React.Dispatch<React.SetStateAction<EditForm>>;
  categoryId?: string;
  onUpload?: (file: File) => void;
  uploading?: boolean;
  showCoverUpload?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Kategori adı" className="sm:col-span-2">
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
        />
      </Field>
      <Field label="Slug (boş = otomatik)">
        <input
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          className={inputClass}
          placeholder="elektrik"
        />
      </Field>
      <Field label="Sıra">
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
          className={inputClass}
        />
      </Field>
      <Field label="İkon">
        <select
          value={form.icon}
          onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          className={inputClass}
        >
          {ICON_OPTIONS.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Açıklama" className="sm:col-span-2">
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={3}
          className={inputClass}
        />
      </Field>
      <Field label="Kapak görsel URL" className="sm:col-span-2">
        <input
          value={form.coverImageUrl}
          onChange={(e) =>
            setForm((f) => ({ ...f, coverImageUrl: e.target.value }))
          }
          className={inputClass}
          placeholder="https://… veya /gorsel.jpg"
        />
      </Field>
      {showCoverUpload && categoryId && onUpload ? (
        <div className="sm:col-span-2">
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
            {uploading ? "Yükleniyor…" : "Kapak fotoğrafı yükle (CDN)"}
          </label>
          {form.coverImageUrl ? (
            <div className="relative mt-2 h-24 overflow-hidden rounded-xl">
              <Image
                src={form.coverImageUrl}
                alt=""
                fill
                className="object-cover"
                unoptimized={form.coverImageUrl.startsWith("http")}
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <label className="flex items-center gap-2 sm:col-span-2">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) =>
            setForm((f) => ({ ...f, isActive: e.target.checked }))
          }
          className="h-4 w-4 accent-[#087a61]"
        />
        <span className="text-sm font-semibold text-[#53635f]">
          Kategori aktif (sitede görünür)
        </span>
      </label>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-[#087a61]";

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
