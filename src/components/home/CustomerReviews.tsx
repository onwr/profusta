"use client";

import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Star } from "lucide-react";
import type { HomepageItemData } from "@/lib/homepage/defaults";
import { homeSectionHeader, homeSectionX } from "@/lib/homepage/section-layout";

type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
};

export function CustomerReviews({
  section,
  testimonials,
}: {
  section: SectionCopy;
  testimonials: HomepageItemData[];
}) {
  return (
    <SectionReveal className={`bg-white pb-12 ${homeSectionX}`}>
      <FadeIn className={`mb-8 ${homeSectionHeader}`}>
        <div>
          <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
            {section.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#083228]">
            {section.title}
          </h2>
          <p className="mt-2 text-sm text-[#53635f]">{section.subtitle}</p>
        </div>
      </FadeIn>

      <StaggerChildren className="grid gap-7 lg:grid-cols-3">
        {testimonials.map((review) => {
          const name = review.title ?? "";
          const rating = review.rating ?? 5;

          return (
            <StaggerItem key={review.id}>
              <article className="rounded-3xl bg-white p-7 shadow-[0_14px_40px_rgba(15,23,42,0.07)] ring-1 ring-black/5">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d9ebe5] text-base font-black text-[#087a61]">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-[#083228]">
                        {name}
                      </div>
                      <div className="text-xs font-medium text-[#53635f]">
                        {review.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 text-[#f5b326]">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-sm leading-7 text-[#53635f]">{review.body}</p>
              </article>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </SectionReveal>
  );
}
