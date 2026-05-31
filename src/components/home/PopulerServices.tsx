"use client";

import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { CategoryMediaCard } from "@/components/category/category-media-card";
import { getHomepageIcon } from "@/lib/homepage/icons";
import type { EnrichedFeaturedService } from "@/lib/homepage/enrich-featured";
import { homeSectionHeader, homeSectionX } from "@/lib/homepage/section-layout";
import Link from "next/link";

type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export function PopularServices({
  section,
  items,
}: {
  section: SectionCopy;
  items: EnrichedFeaturedService[];
}) {
  return (
    <SectionReveal className={`bg-white py-12 ${homeSectionX}`}>
      <div className={`mb-10 ${homeSectionHeader}`}>
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
          className="inline-flex w-fit shrink-0 rounded-full border border-[#d7e5e1] px-5 py-2.5 text-sm font-bold text-[#087a61] transition hover:bg-[#eef8f5]"
        >
          {section.ctaLabel}
        </Link>
      </div>

      <StaggerChildren className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((service) => (
          <StaggerItem key={service.id}>
            <CategoryMediaCard
              href={service.href ?? "/hizmetler"}
              title={service.title ?? ""}
              description={service.description}
              coverImageUrl={service.coverImageUrl}
              Icon={getHomepageIcon(service.categoryIcon ?? service.icon)}
              badge={service.subtitle}
              priceLabel={service.priceLabel}
            />
          </StaggerItem>
        ))}
      </StaggerChildren>
    </SectionReveal>
  );
}
