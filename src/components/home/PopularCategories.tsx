"use client";

import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { homeSectionHeader, homeSectionX } from "@/lib/homepage/section-layout";

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
      <FadeIn className={`mb-10 ${homeSectionHeader}`}>
        <div>
          <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
            {section.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#083228]">
            {section.title}
          </h2>
          <p className="mt-2 text-sm text-[#53635f]">{section.subtitle}</p>
        </div>

        <Link
          href={section.ctaHref}
          className="hidden rounded-full border border-[#d7e5e1] px-5 py-2.5 text-sm font-bold text-[#087a61] transition hover:bg-[#eef8f5] sm:inline-flex"
        >
          {section.ctaLabel}
        </Link>
      </FadeIn>

      <StaggerChildren className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {categories.map((category) => (
          <StaggerItem key={category.id}>
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

  return (
    <Link
      href={`${ROUTES.categories}/${category.slug}`}
      className="group block overflow-hidden rounded-2xl border border-[#e8eeeb] bg-white shadow-[0_10px_36px_rgba(8,50,40,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:shadow-[0_16px_44px_rgba(8,50,40,0.11)]"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-[#eef3f1]">
        {cover ? (
          <Image
            src={cover}
            alt={category.name}
            fill
            className="object-cover transition object-right duration-500 group-hover:scale-[1.03]"
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            unoptimized={cover.startsWith("http")}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-[#f2f7f5] to-[#e7f2ef]">
            <Icon className="h-12 w-12 text-[#087a61]/35" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="px-3 py-4 text-center sm:px-4 sm:py-5">
        <h3 className="text-sm font-bold leading-snug text-[#083228] transition group-hover:text-[#087a61] sm:text-[15px]">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
