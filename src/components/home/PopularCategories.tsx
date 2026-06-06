"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { homeSectionX } from "@/lib/homepage/section-layout";

export type HomeCategory = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl: string | null;
  _count: { services: number };
};

type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export function PopularCategories({
  categories,
  section,
}: {
  categories: HomeCategory[];
  section: SectionCopy;
}) {
  return (
    <SectionReveal className={`bg-white pb-12 ${homeSectionX}`}>
      <FadeIn className="mb-10 flex max-w-7xl mx-auto flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[#083228]">
          {section.title}
        </h2>

        <Link
          href={section.ctaHref}
          className="hidden rounded-full border border-[#d7e5e1] px-5 py-2.5 text-sm font-bold text-[#087a61] transition hover:bg-[#eef8f5] sm:inline-flex"
        >
          {section.ctaLabel}
        </Link>
      </FadeIn>

      <StaggerChildren className="mx-auto grid max-w-7xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
        {categories.map((category) => (
          <StaggerItem key={category.id} className="h-full">
            <PopularCategoryCard category={category} />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </SectionReveal>
  );
}

function PopularCategoryCard({ category }: { category: HomeCategory }) {
  const Icon = getCategoryIcon(category.icon);
  const cover = category.coverImageUrl;
  const serviceCount = category._count.services;

  return (
    <Link
      href={`${ROUTES.categories}/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.05)] transition duration-200 hover:border-[#d1d5db] hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)]"
    >
      <div className="relative aspect-5/4 w-full shrink-0 overflow-hidden bg-[#f3f4f6]">
        {cover ? (
          <Image
            src={cover}
            alt={category.name}
            fill
            className="object-cover object-right transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 50vw, 25vw"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#f3f4f6]">
            <Icon className="h-14 w-14 text-[#087a61]/30" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-3 py-4 text-center sm:px-4 sm:py-5">
        <h3 className="text-[15px] font-bold leading-snug text-[#083228] sm:text-base">
          {category.name}
        </h3>
        {serviceCount > 0 ? (
          <p className="mt-1.5 text-[11px] font-normal leading-snug text-[#6b7280] sm:text-xs">
            {serviceCount} hizmet seçeneği
          </p>
        ) : null}
      </div>
    </Link>
  );
}
