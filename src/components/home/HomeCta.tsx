"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
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
      <FadeIn className="relative overflow-hidden rounded-2xl border border-[#e8ecf0] bg-[#0f1419] px-5 py-10 shadow-[0_24px_80px_rgba(15,20,25,0.18)] sm:rounded-[32px] sm:px-12 sm:py-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_42%),radial-gradient(circle_at_85%_100%,rgba(148,163,184,0.12),transparent_38%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_48%,rgba(255,255,255,0.02)_100%)]" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[12px] font-bold tracking-wide text-white/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#cbd5e1]" />
              {cta.eyebrow}
            </span>

            <h2 className="mt-5 max-w-[560px] text-[30px] font-black leading-tight tracking-[-0.03em] text-white sm:text-[40px]">
              {cta.title}
            </h2>

            <p className="mt-4 max-w-[480px] text-[15px] leading-7 text-[#94a3b8]">
              {cta.text}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:items-end">
            <Link
              href={cta.primaryHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-7 text-sm font-black text-[#0f1419] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:bg-[#f8fafc]"
            >
              {cta.primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={cta.secondaryHref}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10"
            >
              {cta.secondaryLabel}
            </Link>
          </div>
        </div>
      </FadeIn>
    </SectionReveal>
  );
}
