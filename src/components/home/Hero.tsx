"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { heroStaggerContainer, heroStaggerItem } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { ROUTES } from "@/lib/constants";
import type { HomepageConfigData } from "@/lib/homepage/defaults";

type HeroProps = Pick<
  HomepageConfigData,
  "heroTitle" | "heroSubtitle" | "heroImageUrl" | "heroSearchPlaceholder"
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
        : ROUTES.categories
    );
  }

  return (
    <section className="relative overflow-x-clip bg-white">
      {/* SOL DEKOR */}
      <Image
        src="/profusta-sol-ust-sekil.svg"
        alt=""
        width={420}
        height={520}
        priority
        className="pointer-events-none absolute left-0 top-16 z-0 hidden w-[360px] select-none lg:block xl:w-[430px]"
      />

      {/* SAĞ DEKOR */}
      <Image
        src="/profusta-sag-ust-sekil.svg"
        alt=""
        width={460}
        height={460}
        priority
        className="pointer-events-none absolute right-0 top-0 z-0 hidden w-[390px] select-none lg:block xl:w-[480px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-screen-2xl flex-col items-center px-5 pb-8 pt-20 text-center sm:px-8 lg:px-12">
        <motion.div
          className="mx-auto flex w-full max-w-5xl flex-col items-center"
          variants={heroStaggerContainer}
          initial={initial}
          animate={animate}
          transition={heroTransition}
        >
          <motion.h1
            variants={heroStaggerItem}
            transition={heroTransition}
            className="max-w-4xl text-[42px] font-semibold leading-[1.08] tracking-[-0.055em] text-[#083228] sm:text-[54px] lg:text-[68px]"
          >
            {titleLines.length > 0 ? (
              titleLines.map((line, index) => (
                <span key={index}>
                  {line}
                  {index < titleLines.length - 1 ? <br /> : null}
                </span>
              ))
            ) : (
              <>
                Eviniz için güvenilir
                <br />
                ustaları bulun
              </>
            )}
          </motion.h1>

          <motion.p
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-6 max-w-3xl text-[17px] font-light leading-8 text-[#3f5650] sm:text-xl sm:leading-9"
          >
            {hero.heroSubtitle}
          </motion.p>

          <motion.div
            variants={heroStaggerItem}
            transition={heroTransition}
            className="mt-10 w-full max-w-[820px] rounded-full shadow-[0_8px_32px_rgba(8,50,40,0.12)] ring-1 ring-black/10 max-sm:rounded-2xl max-sm:shadow-[0_6px_24px_rgba(8,50,40,0.1)]"
          >
            <form
              onSubmit={handleSearch}
              className="flex h-[72px] overflow-hidden rounded-full bg-white max-sm:h-14 max-sm:rounded-2xl"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4 px-7 max-sm:gap-3 max-sm:px-4">
                <Search className="h-6 w-6 shrink-0 text-[#087A61] max-sm:h-5 max-sm:w-5" />

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={hero.heroSearchPlaceholder}
                  className="h-full min-w-0 flex-1 bg-transparent text-left text-[18px] font-extralight text-[#083228] outline-none placeholder:text-[#8b9b96] max-sm:text-sm"
                />
              </div>

              <button
                type="submit"
                aria-label="Usta ara"
                className="flex w-[170px] shrink-0 items-center justify-center gap-3 bg-[#087A61] text-[17px] font-black text-white transition hover:bg-[#06644f] max-sm:w-14"
              >
                <Search className="h-6 w-6 max-sm:h-5 max-sm:w-5" />
                <span className="max-sm:hidden">Usta Ara</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}