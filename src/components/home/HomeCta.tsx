"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/lib/homepage/defaults";
import { homeSectionX } from "@/lib/homepage/section-layout";

type CtaCopy = {
  eyebrow: string;
  title: string;
  text: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

const defaultCta: CtaCopy = {
  eyebrow: DEFAULT_HOMEPAGE_CONFIG.ctaEyebrow,
  title: DEFAULT_HOMEPAGE_CONFIG.ctaTitle,
  text: DEFAULT_HOMEPAGE_CONFIG.ctaText,
  primaryLabel: DEFAULT_HOMEPAGE_CONFIG.ctaPrimaryLabel,
  primaryHref: DEFAULT_HOMEPAGE_CONFIG.ctaPrimaryHref,
  secondaryLabel: DEFAULT_HOMEPAGE_CONFIG.ctaSecondaryLabel,
  secondaryHref: DEFAULT_HOMEPAGE_CONFIG.ctaSecondaryHref,
};

export function HomeCta({ cta = defaultCta }: { cta?: CtaCopy }) {
  return (
    <SectionReveal className={`bg-white pb-20 ${homeSectionX}`}>
      <FadeIn className="relative overflow-hidden rounded-2xl bg-linear-to-r from-[#06291f] via-[#07372b] to-[#041b15] px-5 py-10 sm:rounded-[32px] sm:px-12 sm:py-12 lg:px-16">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#0c8b6f]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-[#0c8b6f]/15 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[12px] font-black tracking-wide text-white/90">
              <ShieldCheck className="h-3.5 w-3.5" />
              {cta.eyebrow}
            </span>

            <h2 className="mt-5 max-w-[560px] text-[30px] font-black leading-tight tracking-[-0.03em] text-white sm:text-[40px]">
              {cta.title}
            </h2>

            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-white/70">
              {cta.text}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href={cta.primaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-black text-[#06291f] transition hover:bg-[#eef8f5]"
            >
              {cta.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={cta.secondaryHref}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 px-7 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </FadeIn>
    </SectionReveal>
  );
}
