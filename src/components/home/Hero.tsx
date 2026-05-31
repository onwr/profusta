"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react";
import {
  heroImage,
  heroStaggerContainer,
  heroStaggerItem,
} from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { ROUTES } from "@/lib/constants";
import type { HomepageConfigData } from "@/lib/homepage/defaults";

type HeroProps = Pick<
  HomepageConfigData,
  | "heroBadge"
  | "heroTitle"
  | "heroSubtitle"
  | "heroImageUrl"
  | "heroSearchPlaceholder"
  | "heroRating"
  | "heroRatingLabel"
  | "heroPrimaryCtaLabel"
  | "heroPrimaryCtaHref"
  | "heroSecondaryCtaLabel"
  | "heroSecondaryCtaHref"
>;

export function HomeHero({ hero }: { hero: HeroProps }) {
  const { initial, animate, heroTransition } = useMotionConfig();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const titleLines = hero.heroTitle.split("\n").filter(Boolean);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed
        ? `${ROUTES.categories}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.categories,
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#f7f7f3]">
      <div className="grid min-h-[520px] w-full grid-cols-1 items-center lg:grid-cols-[42%_58%]">
        <motion.div
          className="relative z-10 py-16 pl-8 pr-6 sm:pl-14 lg:pl-16 xl:pl-20 2xl:pl-24"
          variants={heroStaggerContainer}
          initial={initial}
          animate={animate}
          transition={heroTransition}
        >
          <motion.span
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#e5f3ef] px-4 py-1.5 text-[12px] font-black tracking-wide text-[#087a61]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {hero.heroBadge}
          </motion.span>

          <motion.h1
            variants={heroStaggerItem}
            transition={heroTransition}
            className="max-w-[440px] text-[44px] font-black leading-[0.95] tracking-[-0.045em] text-[#083228] sm:text-[58px] lg:text-[64px]"
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < titleLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </motion.h1>

          <motion.p
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-5 max-w-[390px] text-[15px] leading-6 text-[#53635f]"
          >
            {hero.heroSubtitle}
          </motion.p>

          <motion.form
            variants={heroStaggerItem}
            transition={heroTransition}
            onSubmit={handleSearch}
            className="mt-8 flex h-[46px] max-w-[470px] overflow-hidden rounded-xl bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] ring-1 ring-black/5"
          >
            <div className="flex flex-1 items-center gap-3 px-5">
              <Search className="h-4 w-4 text-[#0c8b6f]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={hero.heroSearchPlaceholder}
                className="h-full w-full bg-transparent text-sm text-[#263b36] outline-none placeholder:text-[#8b9b96]"
              />
            </div>

            <button
              type="submit"
              aria-label="Hizmet ara"
              className="grid w-[64px] place-items-center bg-[#087a61] text-white transition hover:bg-[#06644f]"
            >
              <Search className="h-5 w-5" />
            </button>
          </motion.form>

          <motion.div
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-5 flex max-w-[470px] flex-wrap items-center gap-3"
          >
            <Link
              href={hero.heroPrimaryCtaHref}
              className="inline-flex h-[46px] items-center gap-2 rounded-xl bg-[#087a61] px-6 text-sm font-black text-white shadow-[0_10px_28px_rgba(8,122,97,0.25)] transition hover:bg-[#06644f]"
            >
              {hero.heroPrimaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={hero.heroSecondaryCtaHref}
              className="inline-flex h-[46px] items-center rounded-xl border border-[#d7e5e1] bg-white px-6 text-sm font-bold text-[#087a61] transition hover:bg-[#eef8f5]"
            >
              {hero.heroSecondaryCtaLabel}
            </Link>
          </motion.div>

          <motion.div
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-8 flex max-w-[520px] flex-wrap gap-6"
          >
            <TrustItem
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Güvenilir Ustalar"
              text="Kimlik doğrulama"
            />
            <TrustItem
              icon={<Tag className="h-4 w-4" />}
              title="Uygun Fiyatlar"
              text="En iyi teklifleri alın"
            />
            <TrustItem
              icon={<Headphones className="h-4 w-4" />}
              title="7/24 Destek"
              text="Yardımınızdayız"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="relative hidden h-full w-full overflow-hidden lg:block"
          variants={heroImage}
          initial={initial}
          animate={animate}
          transition={{ ...heroTransition, delay: 0.15 }}
        >
          <Image
            src={hero.heroImageUrl}
            alt="ProfUsta hizmet uzmanı"
            fill
            priority
            className="object-cover object-center"
            unoptimized={hero.heroImageUrl.startsWith("http")}
          />

          <div className="absolute inset-y-0 left-0 w-[42%] bg-linear-to-r from-[#f7f7f3] via-[#f7f7f3]/80 to-transparent" />

          <motion.div
            variants={heroStaggerItem}
            initial={initial}
            animate={animate}
            transition={{ ...heroTransition, delay: 0.35 }}
            className="absolute right-10 top-1/2 w-[450px] -translate-y-1/2 rounded-3xl bg-white/95 px-8 py-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.16)] backdrop-blur xl:right-24 2xl:right-36"
          >
            <div className="text-xl font-black text-[#087a61]">
              {hero.heroRating}
            </div>

            <div className="mt-3 text-xl tracking-[3px] text-[#f5b51b]">
              ★★★★★
            </div>

            <p className="mt-4 text-sm font-semibold text-[#53635f]">
              {hero.heroRatingLabel}
            </p>

            <div className="mt-5 flex justify-center -space-x-2">
              {["A", "B", "C", "D", "E"].map((item) => (
                <div
                  key={item}
                  className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#d9ebe5] text-xs font-black text-[#087a61]"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="mt-5 text-xs font-semibold text-[#7b8b87]">
              Bize güvenen binlerce kişi
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e5f3ef] text-[#087a61]">
        {icon}
      </div>

      <div>
        <div className="text-[13px] font-black leading-4 text-[#083228]">
          {title}
        </div>
        <div className="mt-1 text-[11px] leading-4 text-[#667570]">{text}</div>
      </div>
    </div>
  );
}
