"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { homeSectionX } from "@/lib/homepage/section-layout";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { cn } from "@/lib/utils";

export type CategoryWithServices = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl: string | null;
  services: {
    id: string;
    slug: string;
    name: string;
  }[];
};

export function CategoryServiceBrowser({
  categories,
}: {
  categories: CategoryWithServices[];
}) {
  if (categories.length === 0) return null;

  return (
    <SectionReveal className={`bg-white pb-12 pt-1 ${homeSectionX}`}>
      <CategoryTabScroller categories={categories} />
    </SectionReveal>
  );
}

const SCROLL_STEP = 220;

function CategoryTabScroller({
  categories,
}: {
  categories: CategoryWithServices[];
}) {
  const { reduced, fastTransition } = useMotionConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [needsScroll, setNeedsScroll] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const overflow = maxScroll > 8;

    setNeedsScroll(overflow);
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScroll - 8);

    if (!overflow && el.scrollLeft !== 0) {
      el.scrollLeft = 0;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [updateScrollState, categories.length]);

  function scrollTabs(direction: -1 | 1) {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div
      className={cn(
        "flex items-center",
        needsScroll ? "gap-1.5 sm:gap-2" : "justify-center",
      )}
    >
      {needsScroll ? (
        <button
          type="button"
          aria-label="Önceki kategoriler"
          onClick={() => scrollTabs(-1)}
          disabled={!canScrollLeft}
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#dce6e2] bg-white text-[#083228] shadow-sm transition hover:border-[#087A61]/30 hover:bg-[#f4faf7] hover:text-[#087A61] disabled:pointer-events-none disabled:opacity-35 sm:h-9 sm:w-9",
          )}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} />
        </button>
      ) : null}

      <div
        ref={scrollRef}
        className={cn(
          "min-w-0 overflow-x-auto scroll-smooth scrollbar-none",
          needsScroll ? "flex-1" : "flex w-full justify-center",
        )}
      >
        <nav
          aria-label="Hizmet kategorileri"
          className="flex w-max items-stretch justify-center gap-2 border-b border-[#e4ece8] px-0.5 pb-px sm:gap-3"
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const href = `${ROUTES.categories}/${category.slug}`;

            return (
              <motion.div
                key={category.id}
                whileTap={reduced ? undefined : { scale: 0.96 }}
                transition={fastTransition}
              >
                <Link
                  href={href}
                  title={category.name}
                  className="group relative flex shrink-0 flex-col items-center px-2 pt-0.5 text-[#66736f] transition hover:text-[#087A61] sm:px-2.5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f9f8] text-[#6b7c77] transition-colors duration-200 group-hover:bg-[#edf7f3] group-hover:text-[#087A61] sm:h-11 sm:w-11">
                    <Icon
                      className="h-5 w-5 sm:h-[22px] sm:w-[22px]"
                      strokeWidth={1.6}
                    />
                  </span>

                  <span className="mt-2 whitespace-nowrap text-center text-[11px] font-semibold leading-none tracking-tight group-hover:text-[#083228] sm:text-xs">
                    {category.name}
                  </span>

                  <span className="mt-2 mb-0 h-[2px] w-full min-w-full rounded-full bg-transparent px-0.5 transition-colors group-hover:bg-[#087A61]/35" />
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {needsScroll ? (
        <button
          type="button"
          aria-label="Sonraki kategoriler"
          onClick={() => scrollTabs(1)}
          disabled={!canScrollRight}
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#dce6e2] bg-white text-[#083228] shadow-sm transition hover:border-[#087A61]/30 hover:bg-[#f4faf7] hover:text-[#087A61] disabled:pointer-events-none disabled:opacity-35 sm:h-9 sm:w-9",
          )}
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
        </button>
      ) : null}
    </div>
  );
}
