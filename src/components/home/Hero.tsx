"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Clock,
  ClipboardCheck,
  LockKeyhole,
  Search,
  ShieldCheck,
  Star,
  UsersRound,
  Zap,
} from "lucide-react";
import { heroStaggerContainer, heroStaggerItem } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { ROUTES } from "@/lib/constants";
import type { HomepageConfigData } from "@/lib/homepage/defaults";

type HeroProps = Pick<
  HomepageConfigData,
  "heroTitle" | "heroSubtitle" | "heroImageUrl" | "heroSearchPlaceholder"
>;

export function HomeHero({ hero }: { hero: HeroProps }) {
  const { initial, animate, heroTransition, reduced } = useMotionConfig();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const titleLines = hero.heroTitle.split("\n").filter(Boolean);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = query.trim();

    router.push(
      trimmed
        ? `${ROUTES.categories}?q=${encodeURIComponent(trimmed)}`
        : ROUTES.categories
    );
  }

  return (
    <section className="relative min-h-[720px] w-full overflow-hidden bg-[#041b15]">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Image
            src={hero.heroImageUrl}
            alt="ProfUsta hizmet uzmanı"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
            unoptimized={hero.heroImageUrl.startsWith("http")}
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,18,15,0.45)_0%,rgba(3,18,15,0.72)_55%,rgba(3,18,15,0.96)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(8,122,97,0.22)_0%,transparent_48%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[720px] w-full max-w-screen-2xl flex-col items-center justify-center px-6 py-20 text-center sm:px-10 lg:px-16">
        <motion.div
          className="mx-auto flex w-full max-w-5xl flex-col items-center"
          variants={heroStaggerContainer}
          initial={initial}
          animate={animate}
          transition={heroTransition}
        >
          <motion.div
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur-md"
          >
            <ShieldCheck className="h-4 w-4 text-[#36d1ad]" />
            Doğrulanmış ustalarla güvenli hizmet
          </motion.div>

          <motion.h1
            variants={heroStaggerItem}
            transition={heroTransition}
            className="max-w-5xl text-[44px] font-black leading-[1.06] tracking-[-0.055em] text-white sm:text-[58px] lg:text-[72px]"
          >
            {titleLines.map((line, index) => {
              const isLast = index === titleLines.length - 1;

              return (
                <span
                  key={index}
                  className={
                    isLast && titleLines.length > 1
                      ? "text-[#087A61] drop-shadow-[0_12px_35px_rgba(8,122,97,0.45)]"
                      : undefined
                  }
                >
                  {line}
                  {index < titleLines.length - 1 ? <br /> : null}
                </span>
              );
            })}
          </motion.h1>

          <motion.p
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-7 max-w-3xl text-[17px] font-medium leading-8 text-white/85 sm:text-xl sm:leading-9"
          >
            {hero.heroSubtitle}
          </motion.p>

          <motion.form
            variants={heroStaggerItem}
            transition={heroTransition}
            onSubmit={handleSearch}
            className="mt-11 flex h-[78px] w-full max-w-[920px] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.32)] ring-1 ring-white/20 max-sm:h-14 max-sm:rounded-2xl"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4 px-7 max-sm:gap-3 max-sm:px-4">
              <Search className="h-6 w-6 shrink-0 text-[#087A61] max-sm:hidden" />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={hero.heroSearchPlaceholder}
                className="h-full min-w-0 flex-1 bg-transparent text-left text-[18px] font-medium text-[#083228] outline-none placeholder:text-[#8b9b96] max-sm:text-base"
              />
            </div>

            <button
              type="submit"
              aria-label="Usta bul"
              className="flex w-[210px] shrink-0 items-center justify-center gap-3 bg-[#087A61] text-[18px] font-black text-white transition hover:bg-[#06644f] max-sm:w-14 max-sm:gap-0"
            >
              <Search className="h-6 w-6 max-sm:h-5 max-sm:w-5" />
              <span className="max-sm:hidden">Usta Bul</span>
            </button>
          </motion.form>

          <motion.div
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-10 grid w-full max-w-[930px] gap-4 md:grid-cols-3"
          >
            <TrustPill
              icon={<BadgeCheck className="h-6 w-6" />}
              title="Doğrulanmış Ustalar"
              text="Kimlik ve yetki doğrulaması"
            />
            <TrustPill
              icon={<Zap className="h-6 w-6" />}
              title="Hızlı Teklif"
              text="Kısa sürede fiyat teklifi alın"
            />
            <TrustPill
              icon={<LockKeyhole className="h-6 w-6" />}
              title="Güvenli Hizmet"
              text="Ödemeniz koruma altında"
            />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

function TrustPill({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[24px] border border-white/10 bg-white/12 px-5 py-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/12 text-[#36d1ad] ring-1 ring-white/10">
        {icon}
      </div>

      <div>
        <h3 className="text-[15px] font-black text-white">{title}</h3>
        <p className="mt-1 text-sm font-medium text-white/72">{text}</p>
      </div>
    </div>
  );
}

function HeroStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-5 border-white/10 px-7 py-7 text-left md:border-r md:last:border-r-0">
      <div className="text-white/90">{icon}</div>

      <div>
        <p className="text-[30px] font-black leading-none text-white">
          {value}
        </p>
        <p className="mt-2 text-sm font-medium text-white/72">{label}</p>
      </div>
    </div>
  );
}