"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Search, Tags } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CategoryPickerItem = {
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl?: string | null;
  description?: string | null;
  serviceCount?: number;
};

type FilterKey = "all" | "selected" | "unselected";

type Props = {
  categories: CategoryPickerItem[];
  selected: string[];
  onChange: (slugs: string[]) => void;
  loading?: boolean;
  invalid?: boolean;
};

export function CategoryPicker({
  categories,
  selected,
  onChange,
  loading = false,
  invalid = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [draft, setDraft] = useState<string[]>(selected);

  useEffect(() => {
    if (open) setDraft(selected);
  }, [open, selected]);

  const selectedCategories = useMemo(
    () => categories.filter((c) => selected.includes(c.slug)),
    [categories, selected],
  );

  const counts = useMemo(
    () => ({
      all: categories.length,
      selected: draft.length,
      unselected: categories.length - draft.length,
    }),
    [categories.length, draft.length],
  );

  const filtered = useMemo(() => {
    let list = categories;
    const q = query.trim().toLocaleLowerCase("tr-TR");

    if (filter === "selected") {
      list = list.filter((c) => draft.includes(c.slug));
    } else if (filter === "unselected") {
      list = list.filter((c) => !draft.includes(c.slug));
    }

    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLocaleLowerCase("tr-TR").includes(q) ||
          (c.description?.toLocaleLowerCase("tr-TR").includes(q) ?? false),
      );
    }

    return list;
  }, [categories, draft, filter, query]);

  function toggleDraft(slug: string) {
    setDraft((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  function confirmSelection() {
    onChange(draft);
    setOpen(false);
  }

  function clearDraft() {
    setDraft([]);
  }

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border bg-[#f8fcfa]/80 p-4 transition",
          invalid ? "border-red-300 ring-2 ring-red-100" : "border-black/5",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#083228]">Hizmet kategorileri</p>
            <p className="mt-0.5 text-xs text-[#53635f]">
              Verdiğiniz hizmet alanlarını seçin — en az 1 kategori zorunlu
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold",
              selected.length > 0
                ? "bg-[#087a61] text-white"
                : "bg-white text-[#53635f] ring-1 ring-black/5",
            )}
          >
            {selected.length} seçili
          </span>
        </div>

        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : selectedCategories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <CategoryChip key={cat.slug} category={cat} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-[#087a61]/25 bg-white px-4 py-6 text-center">
            <Tags className="mx-auto h-8 w-8 text-[#087a61]/35" />
            <p className="mt-2 text-sm font-semibold text-[#53635f]">
              Henüz kategori seçilmedi
            </p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          disabled={loading || categories.length === 0}
          className="mt-4 h-11 w-full justify-between rounded-xl border-[#087a61]/25 bg-white font-bold text-[#087a61] hover:bg-[#eef8f5]"
        >
          {selected.length > 0 ? "Kategorileri düzenle" : "Kategori seç"}
          <ChevronRight className="h-4 w-4" />
        </Button>

        {invalid ? (
          <p className="mt-3 text-xs font-semibold text-red-600">
            En az bir hizmet kategorisi seçmelisiniz.
          </p>
        ) : selected.length > 0 ? (
          <p className="mt-3 text-xs font-semibold text-[#10b981]">
            {selected.length} kategori seçildi
          </p>
        ) : null}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Hizmet kategorileri"
        description="Verdiğiniz hizmet alanlarını kapak görselleriyle seçin"
        size="2xl"
        footer={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#083228]">
                {draft.length} kategori seçili
              </span>
              {draft.length > 0 ? (
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-xs font-semibold text-[#53635f] underline-offset-2 hover:text-[#087a61] hover:underline"
                >
                  Temizle
                </button>
              ) : null}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => setOpen(false)}
              >
                Vazgeç
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl px-6"
                disabled={draft.length === 0}
                onClick={confirmSelection}
              >
                Seçimi onayla
              </Button>
            </div>
          </div>
        }
      >
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Kategori ara..."
            className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fcfa] pl-10 pr-4 text-sm text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20"
          />
        </div>

        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Kategori filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "selected" as const, label: "Seçili" },
              { key: "unselected" as const, label: "Diğerleri" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-bold transition",
                filter === key
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "bg-[#f8fcfa] text-[#53635f] hover:text-[#087a61]",
              )}
            >
              {label} ({counts[key]})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-12 text-center">
            <Tags className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#53635f]">
              {categories.length === 0
                ? "Henüz aktif kategori yok."
                : "Arama veya filtreye uygun kategori bulunamadı."}
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((cat) => (
              <li key={cat.slug}>
                <CategorySelectCard
                  category={cat}
                  selected={draft.includes(cat.slug)}
                  onToggle={() => toggleDraft(cat.slug)}
                />
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </>
  );
}

function CategoryChip({ category }: { category: CategoryPickerItem }) {
  const cover = category.coverImageUrl;

  return (
    <span className="inline-flex max-w-[160px] items-center gap-2 rounded-xl border border-[#087a61]/20 bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#eef8f5]">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover"
            sizes="40px"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <span className="flex h-full items-center justify-center px-1 text-center text-[8px] font-bold leading-tight text-[#087a61]">
            {category.name.slice(0, 12)}
          </span>
        )}
      </span>
      <span className="truncate text-xs font-bold text-[#083228]">{category.name}</span>
    </span>
  );
}

function CategorySelectCard({
  category,
  selected,
  onToggle,
}: {
  category: CategoryPickerItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const cover = category.coverImageUrl;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className={cn(
        "group relative w-full overflow-hidden rounded-[1.25rem] border text-left transition duration-300",
        selected
          ? "border-[#087a61] shadow-[0_0_0_2px_rgba(8,122,97,0.25)]"
          : "border-black/5 hover:-translate-y-0.5 hover:border-[#087a61]/30 hover:shadow-lg",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f1]">
        {cover ? (
          <Image
            src={cover}
            alt={category.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-[#e7f2ef] to-[#d9ebe6] px-4">
            <span className="text-center text-sm font-black leading-snug text-[#087a61]">
              {category.name}
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#083228]/80 via-[#083228]/20 to-transparent" />

        {selected ? (
          <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#087a61] text-white shadow-md">
            <CheckCircle2 className="h-5 w-5" />
          </span>
        ) : (
          <span className="absolute right-3 top-3 h-8 w-8 rounded-full border-2 border-white/80 bg-black/10 backdrop-blur-sm transition group-hover:border-white" />
        )}

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="text-base font-black leading-snug text-white drop-shadow-sm">
            {category.name}
          </p>
          {category.description ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/85">
              {category.description}
            </p>
          ) : null}
          {category.serviceCount != null && category.serviceCount > 0 ? (
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-white/70">
              {category.serviceCount} alt hizmet
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
