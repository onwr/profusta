"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionReveal } from "@/components/motion/section-reveal";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { homeSectionX } from "@/lib/homepage/section-layout";
import { cn } from "@/lib/utils";

export type CategoryWithServices = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl: string | null;
  services: {
    id: string;
    slug: string;
    name: string;
  }[];
};

type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function CategoryServiceBrowser({
  categories,
  section,
}: {
  categories: CategoryWithServices[];
  section: SectionCopy;
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  if (categories.length === 0) return null;

  const activeCategory =
    categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <SectionReveal className={`bg-white py-12 ${homeSectionX}`}>
      <div className="mb-8">
        <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
          {section.eyebrow}
        </span>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#083228]">
          {section.title}
        </h2>
        <p className="mt-2 text-sm text-[#53635f]">{section.subtitle}</p>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max flex-nowrap items-end justify-start gap-5 border-b border-[#e4ece8] sm:gap-7 lg:min-w-0 lg:w-full lg:justify-between lg:gap-3">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const isActive = category.id === activeCategory.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveId(category.id)}
                className={cn(
                  "group flex shrink-0 flex-col items-center gap-2.5 px-1 pb-0 lg:min-w-0 lg:flex-1 lg:px-2",
                  isActive ? "text-[#087a61]" : "text-[#66736f] hover:text-[#083228]",
                )}
              >
                <Icon
                  className={cn(
                    "h-7 w-7 transition-colors sm:h-8 sm:w-8",
                    isActive
                      ? "text-[#087a61]"
                      : "text-[#9aa8a3] group-hover:text-[#53635f]",
                  )}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                <span
                  className={cn(
                    "whitespace-nowrap text-center text-[12px] leading-none sm:text-[13px]",
                    isActive ? "font-bold text-[#087a61]" : "font-medium text-[#66736f]",
                  )}
                >
                  {category.name}
                </span>
                <span
                  className={cn(
                    "mt-2 h-[3px] w-full rounded-full transition-colors",
                    isActive ? "bg-[#087a61]" : "bg-transparent",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {activeCategory.services.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/10 bg-[#f8fcfa] px-6 py-10 text-center">
          <p className="text-sm font-medium text-[#66736f]">
            Bu kategoride henüz alt hizmet yok.
          </p>
          <Link
            href={`${ROUTES.categories}/${activeCategory.slug}`}
            className="mt-3 inline-block text-sm font-bold text-[#087a61] hover:underline"
          >
            Kategoriyi incele
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {activeCategory.services.map((service) => (
            <ServiceCard
              key={service.id}
              href={`${ROUTES.createRequest}?kategori=${activeCategory.slug}&hizmet=${service.slug}`}
              title={service.name}
              coverImageUrl={activeCategory.coverImageUrl}
              categoryIcon={activeCategory.icon}
            />
          ))}
        </div>
      )}
    </SectionReveal>
  );
}

function ServiceCard({
  href,
  title,
  coverImageUrl,
  categoryIcon,
}: {
  href: string;
  title: string;
  coverImageUrl: string | null;
  categoryIcon: string | null;
}) {
  const Icon = getCategoryIcon(categoryIcon);

  return (
    <Link
      href={href}
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#eef3f1] ring-1 ring-black/5 transition hover:ring-[#087a61]/30"
    >
      {coverImageUrl ? (
        <>
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            unoptimized={coverImageUrl.startsWith("http")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#eef8f5] to-[#dceee8]">
          <Icon className="h-10 w-10 text-[#087a61]/35" strokeWidth={1.5} />
        </div>
      )}

      <span className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-snug text-white drop-shadow-sm sm:text-[15px]">
        {title}
      </span>
    </Link>
  );
}
