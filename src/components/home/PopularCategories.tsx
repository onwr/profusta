"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import type { HomepageItemData } from "@/lib/homepage/defaults";
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
  guarantee,
  stats,
}: {
  categories: HomeCategory[];
  section: SectionCopy;
  guarantee: { title: string; text: string };
  stats: HomepageItemData[];
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

      <StaggerChildren className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-8">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.icon);

          return (
            <StaggerItem key={category.id}>
              <Link
                href={`${ROUTES.categories}/${category.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <CategoryCoverThumb
                  coverImageUrl={category.coverImageUrl}
                  Icon={Icon}
                  name={category.name}
                  size="md"
                  className="transition group-hover:ring-2 group-hover:ring-[#087a61]/30"
                />
                <span className="mt-3 line-clamp-2 text-sm font-semibold text-[#53635f] transition group-hover:text-[#087a61]">
                  {category.name}
                </span>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerChildren>

      <FadeIn
        className="mt-10 overflow-hidden rounded-2xl bg-linear-to-r from-[#f2fbf6] via-[#f8fbf9] to-[#eef8f5] px-4 py-6 sm:rounded-3xl sm:px-8 sm:py-8"
        delay={0.1}
      >
        <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-center lg:gap-6 xl:gap-10">
          {stats.length > 0 ? (
            <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:flex-1">
              {stats.map((stat) => (
                <Stat
                  key={stat.id}
                  value={stat.title ?? ""}
                  label={stat.subtitle ?? ""}
                />
              ))}
            </div>
          ) : null}

          <div
            className={`flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 ${
              stats.length > 0
                ? "border-t border-[#087a61]/10 pt-6 lg:w-[min(100%,26rem)] lg:shrink-0 lg:border-t-0 lg:pt-0 xl:w-[min(100%,28rem)]"
                : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-[#083228]">
                {guarantee.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#53635f] sm:max-w-[360px]">
                {guarantee.text}
              </p>
            </div>

            <div className="grid h-16 w-16 shrink-0 place-items-center self-start rounded-full bg-[#dff3e8] text-[#087a61] sm:h-20 sm:w-20 sm:self-center">
              <ShieldCheck className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>
        </div>
      </FadeIn>
    </SectionReveal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-[#8ad6aa] sm:mx-0 sm:mb-3" />
      <div className="text-xl font-black text-[#087a61] sm:text-2xl">{value}</div>
      <div className="mt-1 text-xs font-medium leading-snug text-[#53635f] sm:text-sm">
        {label}
      </div>
    </div>
  );
}
