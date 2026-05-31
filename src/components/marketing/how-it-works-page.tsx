"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { HomeCta } from "@/components/home/HomeCta";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import {
  CUSTOMER_FLOW,
  MAIN_STEPS,
  PROVIDER_FLOW,
  TRUST_CARDS,
} from "@/lib/content/how-it-works";
import { ROUTES } from "@/lib/constants";

export function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <section className="relative overflow-hidden bg-linear-to-b from-[#06291f] via-[#07372b] to-[#041b15]">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-[#0b8067]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5" />
            ProfUsta güvencesiyle
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-[42px]">
            Nasıl Çalışır?
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
            Ev ve iş yerinizdeki teknik ihtiyaçlar için güvenilir ustalarla
            buluşun. Talep oluşturun, teklifleri karşılaştırın, işinizi güvenle
            tamamlayın.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ROUTES.createRequest}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-[#06291f] transition hover:bg-[#eef8f5]"
            >
              Hemen Teklif Al
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.providers}
              className="inline-flex h-11 items-center rounded-xl border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Ustaları Keşfet
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
        <SectionReveal>
          <FadeIn className="mb-10 text-center">
            <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
              Adımlar
            </span>
            <h2 className="mt-3 text-2xl font-black text-[#083228] sm:text-3xl">
              Dört adımda işinizi tamamlayın
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#53635f]">
              ProfUsta üzerinden hizmet almak birkaç dakika sürer; süreç baştan
              sona şeffaf ve güvenlidir.
            </p>
          </FadeIn>

          <StaggerChildren className="grid gap-6 sm:grid-cols-2">
            {MAIN_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <StaggerItem key={step.number}>
                  <article className="h-full rounded-3xl border border-black/5 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex items-start gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                        <Icon className="h-7 w-7 stroke-[1.7]" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11px] font-black uppercase tracking-wide text-[#087a61]">
                          Adım {step.number}
                        </span>
                        <h3 className="mt-1 text-lg font-black text-[#083228]">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[#53635f]">
                      {step.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {step.bullets.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-sm text-[#53635f]"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#087a61]" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </SectionReveal>

        <SectionReveal className="mt-16">
          <FadeIn className="mb-8 text-center">
            <h2 className="text-2xl font-black text-[#083228] sm:text-3xl">
              Kimler için?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-[#53635f]">
              Müşteri veya usta olarak platforma nasıl katılacağınızı özetledik.
            </p>
          </FadeIn>

          <div className="grid gap-6 lg:grid-cols-2">
            <FlowCard
              title="Müşteri olarak"
              subtitle="Hizmet almak isteyenler için"
              steps={CUSTOMER_FLOW}
              ctaHref={ROUTES.createRequest}
              ctaLabel="Talep Oluştur"
            />
            <FlowCard
              title="Usta olarak"
              subtitle="Hizmet vermek isteyenler için"
              steps={PROVIDER_FLOW}
              ctaHref={ROUTES.providerApply}
              ctaLabel="Usta Başvurusu Yap"
              variant="provider"
            />
          </div>
        </SectionReveal>

        <SectionReveal className="mt-16">
          <FadeIn className="mb-8 text-center">
            <span className="inline-flex items-center rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
              Güvence
            </span>
            <h2 className="mt-3 text-2xl font-black text-[#083228] sm:text-3xl">
              Neden ProfUsta?
            </h2>
          </FadeIn>

          <StaggerChildren className="grid gap-5 sm:grid-cols-3">
            {TRUST_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title}>
                  <article className="h-full rounded-2xl border border-black/5 bg-white p-5 text-center shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-sm font-black text-[#083228]">
                      {card.title}
                    </h3>
                    <p className="mt-2 text-xs leading-5 text-[#53635f]">
                      {card.text}
                    </p>
                  </article>
                </StaggerItem>
              );
            })}
          </StaggerChildren>

          <p className="mt-8 text-center text-sm text-[#53635f]">
            Daha fazla soru için{" "}
            <Link
              href={ROUTES.static.faq}
              className="font-bold text-[#087a61] hover:underline"
            >
              Sıkça Sorulan Sorular
            </Link>{" "}
            sayfamıza göz atın.
          </p>
        </SectionReveal>
      </div>

      <HomeCta />
    </div>
  );
}

function FlowCard({
  title,
  subtitle,
  steps,
  ctaHref,
  ctaLabel,
  variant = "customer",
}: {
  title: string;
  subtitle: string;
  steps: readonly { step: string; title: string; text: string }[];
  ctaHref: string;
  ctaLabel: string;
  variant?: "customer" | "provider";
}) {
  return (
    <article
      className={[
        "rounded-3xl border p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]",
        variant === "provider"
          ? "border-[#087a61]/20 bg-linear-to-br from-white to-[#eef8f5]"
          : "border-black/5 bg-white",
      ].join(" ")}
    >
      <h3 className="text-xl font-black text-[#083228]">{title}</h3>
      <p className="mt-1 text-sm text-[#53635f]">{subtitle}</p>
      <ol className="mt-6 space-y-4">
        {steps.map((item) => (
          <li key={item.step} className="flex gap-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#087a61] text-xs font-black text-white">
              {item.step}
            </span>
            <div>
              <p className="text-sm font-black text-[#083228]">{item.title}</p>
              <p className="mt-0.5 text-xs text-[#53635f]">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        href={ctaHref}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#087a61] px-5 text-sm font-black text-white transition hover:bg-[#06644f]"
      >
        {ctaLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
