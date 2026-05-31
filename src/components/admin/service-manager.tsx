"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "@/lib/category-icons";
type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  coverImageUrl: string | null;
};

type ServiceRow = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  category: CategoryOption;
};

export function ServiceManager({
  services,
  categories,
}: {
  services: ServiceRow[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const duplicateCount = useMemo(() => {
    const seen = new Map<string, number>();
    for (const svc of services) {
      const key = `${svc.category.id}::${svc.name.trim().toLocaleLowerCase("tr-TR")}`;
      seen.set(key, (seen.get(key) ?? 0) + 1);
    }
    return [...seen.values()].filter((n) => n > 1).length;
  }, [services]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    return services.filter((svc) => {
      if (filterCategoryId !== "all" && svc.category.id !== filterCategoryId) {
        return false;
      }
      if (!q) return true;
      return (
        svc.name.toLocaleLowerCase("tr-TR").includes(q) ||
        svc.slug.includes(q) ||
        svc.category.name.toLocaleLowerCase("tr-TR").includes(q)
      );
    });
  }, [services, filterCategoryId, query]);

  async function createService(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Kayıt başarısız");
        return;
      }
      setName("");
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setLoading(true);
    await fetch(`/api/admin/services/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setLoading(false);
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Bu alt hizmet silinsin mi?")) return;
    setLoading(true);
    await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  async function runDedupe() {
    if (
      !confirm(
        "Aynı kategoride aynı isimli yinelenen alt hizmetler birleştirilecek. Talepler korunur. Devam?",
      )
    ) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services/dedupe", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Birleştirme başarısız");
        return;
      }
      const merged = data.merged as { name: string; category: string; kept: string }[];
      if (merged?.length) {
        alert(
          `${merged.length} grup birleştirildi:\n${merged
            .slice(0, 12)
            .map((m) => `• ${m.category} / ${m.name} → /${m.kept}`)
            .join("\n")}${merged.length > 12 ? "\n…" : ""}`,
        );
      } else {
        alert("Yinelenen alt hizmet bulunamadı.");
      }
      router.refresh();
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <form
        onSubmit={createService}
        className="flex flex-wrap items-end gap-3 rounded-2xl border border-black/5 bg-white p-6"
      >
        <div>
          <label className="mb-1 block text-xs font-bold text-[#53635f]">Kategori</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-bold text-[#53635f]">
            Alt hizmet adı
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={loading} className="h-10">
          Ekle
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8aa39c]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Alt hizmet ara…"
            className="h-10 w-full rounded-xl border border-black/10 bg-[#f8fcfa] pl-9 pr-3 text-sm outline-none focus:border-[#087a61]"
          />
        </div>
        <select
          value={filterCategoryId}
          onChange={(e) => setFilterCategoryId(e.target.value)}
          className="h-10 rounded-xl border border-black/10 px-3 text-sm"
        >
          <option value="all">Tüm kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {duplicateCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            className="h-10 border-amber-200 text-amber-900 hover:bg-amber-50"
            disabled={loading}
            onClick={runDedupe}
          >
            Yinelenenleri birleştir ({duplicateCount})
          </Button>
        ) : null}
        <p className="text-xs font-semibold text-[#53635f]">
          {filtered.length} / {services.length} kayıt
        </p>
      </div>

      <div className="space-y-3">
        {filtered.map((svc) => {
          const Icon = getCategoryIcon(svc.category.icon);
          const cover = svc.category.coverImageUrl;

          return (
            <article
              key={svc.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-black/5 bg-white p-5"
            >
              <div className="flex min-w-0 items-center gap-4">
                <CategoryCoverThumb
                  coverImageUrl={cover}
                  Icon={Icon}
                  name={svc.category.name}
                  size="sm"
                  rounded="2xl"
                />
                <div className="min-w-0">
                  <p className="font-bold text-[#083228]">{svc.name}</p>
                  <p className="text-sm text-[#53635f]">
                    {svc.category.name} · /{svc.slug}
                  </p>
                  {!svc.isActive ? (
                    <span className="mt-1 inline-block text-xs font-bold text-amber-700">
                      Pasif
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  disabled={loading}
                  onClick={() => toggleActive(svc.id, svc.isActive)}
                >
                  {svc.isActive ? "Pasifleştir" : "Aktifleştir"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 text-red-600"
                  disabled={loading}
                  onClick={() => remove(svc.id)}
                >
                  Sil
                </Button>
              </div>
            </article>
          );
        })}
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/10 py-12 text-center text-sm text-[#53635f]">
            Kayıt bulunamadı.
          </p>
        ) : null}
      </div>
    </div>
  );
}
