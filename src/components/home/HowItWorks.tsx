"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { getHomepageIcon } from "@/lib/homepage/icons";
import type { HomepageItemData } from "@/lib/homepage/defaults";
import { homeSectionX } from "@/lib/homepage/section-layout";

type SectionCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
};

export function HowItWorks({
  section,
  steps,
}: {
  section: SectionCopy;
  steps: HomepageItemData[];
}) {
  return (
    <SectionReveal className={`bg-white pb-20 ${homeSectionX}`}>
      <div className="mx-auto">
        <FadeIn className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#087a61] hover:underline"
          >
            {section.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </FadeIn>

        <div className="relative">
          <div className="absolute left-[12.5%] right-[12.5%] top-[34px] hidden border-t border-dashed border-[#d9e5e1] md:block" />

          <StaggerChildren className="relative grid grid-cols-1 gap-12 md:grid-cols-4">
            {steps.map((step) => {
              const Icon = getHomepageIcon(step.icon);
              const num = step.stepNumber ?? "";

              return (
                <StaggerItem key={step.id}>
                  <div className="relative text-center">
                    <div className="relative z-10 mx-auto grid h-[86px] w-[86px] place-items-center rounded-full bg-[#eef6f2] text-[#087a61]">
                      <Icon className="h-9 w-9 stroke-[1.7]" />
                    </div>

                    <div className="mt-9 text-[15px] font-black text-[#083228]">
                      {num}. {step.title}
                    </div>

                    <p className="mx-auto mt-4 max-w-[220px] text-[14px] leading-6 text-[#53635f]">
                      {step.description}
                    </p>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </div>
    </SectionReveal>
  );
}
