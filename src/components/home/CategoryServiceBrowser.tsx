"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionReveal } from "@/components/motion/section-reveal";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { homeSectionX } from "@/lib/homepage/section-layout";
import { easeOut } from "@/lib/motion/transitions";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { categoryPanel } from "@/lib/motion/variants";
import { cn } from "@/lib/utils";

const categoryTabSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
};

const categoryPanelTransition = {
  duration: 0.3,
  ease: easeOut,
};

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
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");
  const { reduced } = useMotionConfig();

  if (categories.length === 0) return null;

  const activeCategory =
    categories.find((category) => category.id === activeId) ?? categories[0];

  return (
    <SectionReveal className={`bg-white pb-16 pt-2 ${homeSectionX}`}>
      <div className="mx-auto max-w-screen-2xl">
        <CategoryTabScroller
          categories={categories}
          activeId={activeCategory.id}
          onSelect={setActiveId}
        />

        <CategoryPanelContent category={activeCategory} reduced={reduced} />
      </div>
    </SectionReveal>
  );
}

const SCROLL_STEP = 280;

function CategoryTabScroller({
  categories,
  activeId,
  onSelect,
}: {
  categories: CategoryWithServices[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const { reduced, fastTransition } = useMotionConfig();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < maxScroll - 8);
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

  useEffect(() => {
    const el = scrollRef.current?.querySelector<HTMLElement>(
      `[data-category-id="${activeId}"]`,
    );
    el?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  }, [activeId, reduced]);

  function scrollTabs(direction: -1 | 1) {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: reduced ? "auto" : "smooth",
    });
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <button
        type="button"
        aria-label="Önceki kategoriler"
        onClick={() => scrollTabs(-1)}
        disabled={!canScrollLeft}
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dce6e2] bg-white text-[#083228] shadow-sm transition hover:border-[#087A61]/30 hover:bg-[#f4faf7] hover:text-[#087A61] disabled:pointer-events-none disabled:opacity-0 sm:h-11 sm:w-11",
        )}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
      </button>

      <div
        ref={scrollRef}
        className="min-w-0 flex-1 overflow-x-auto scroll-smooth scrollbar-none"
      >
        <div
          role="tablist"
          aria-label="Hizmet kategorileri"
          className="flex w-max items-stretch gap-3 border-b border-[#e4ece8] px-1 pb-px sm:gap-4 md:gap-5"
        >
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            const isActive = category.id === activeId;

            return (
              <motion.button
                key={category.id}
                data-category-id={category.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                title={category.name}
                onClick={() => onSelect(category.id)}
                whileTap={reduced ? undefined : { scale: 0.96 }}
                transition={fastTransition}
                className={cn(
                  "group relative flex shrink-0 flex-col items-center px-3 pt-1 sm:px-4",
                  isActive ? "text-[#087A61]" : "text-[#66736f]",
                )}
              >
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-200 sm:h-16 sm:w-16",
                    isActive
                      ? "bg-[#e8f6f1] text-[#087A61] ring-1 ring-[#087A61]/15"
                      : "bg-[#f6f9f8] text-[#6b7c77] group-hover:bg-[#edf7f3] group-hover:text-[#087A61]",
                  )}
                >
                  <Icon
                    className="h-7 w-7 sm:h-8 sm:w-8"
                    strokeWidth={isActive ? 2.1 : 1.6}
                  />
                </span>

                <span
                  className={cn(
                    "mt-3 whitespace-nowrap text-center text-[13px] leading-none tracking-tight sm:text-sm",
                    isActive
                      ? "font-bold text-[#087A61]"
                      : "font-semibold text-[#53635f] group-hover:text-[#083228]",
                  )}
                >
                  {category.name}
                </span>

                <span className="relative mt-3 mb-0 flex h-[3px] w-full min-w-full items-center justify-center px-1">
                  {isActive ? (
                    reduced ? (
                      <span className="h-full w-full rounded-full bg-[#087A61]" />
                    ) : (
                      <motion.span
                        layoutId="category-tab-underline"
                        className="h-full w-full rounded-full bg-[#087A61]"
                        transition={categoryTabSpring}
                      />
                    )
                  ) : null}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        aria-label="Sonraki kategoriler"
        onClick={() => scrollTabs(1)}
        disabled={!canScrollRight}
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#dce6e2] bg-white text-[#083228] shadow-sm transition hover:border-[#087A61]/30 hover:bg-[#f4faf7] hover:text-[#087A61] disabled:pointer-events-none disabled:opacity-0 sm:h-11 sm:w-11",
        )}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}

function CategoryPanelContent({
  category,
  reduced,
}: {
  category: CategoryWithServices;
  reduced: boolean;
}) {
  const services = category.services;

  const content =
    category.services.length > 0 ? (
      <div className="mt-8 text-center">
        <p className="text-[15px] font-medium text-[#53635f] sm:text-base">
          Almak istediğiniz hizmeti seçebilirsiniz
        </p>

        <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`${ROUTES.createRequest}?kategori=${category.slug}&hizmet=${service.slug}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-black/15 bg-white px-6 text-[14px] font-bold text-[#083228] transition hover:border-[#087A61]/40 hover:bg-[#f4faf7] hover:text-[#087A61] sm:h-14 sm:px-8 sm:text-[15px]"
            >
              {service.name}
            </Link>
          ))}
        </div>
      </div>
    ) : (
      <div className="mt-8 rounded-[28px] border border-dashed border-black/10 bg-[#f8fcfa] px-6 py-10 text-center">
        <p className="text-sm font-medium text-[#66736f]">
          Bu kategoride henüz alt hizmet yok.
        </p>

        <Link
          href={`${ROUTES.categories}/${category.slug}`}
          className="mt-3 inline-block text-sm font-bold text-[#087A61] hover:underline"
        >
          Kategoriyi incele
        </Link>
      </div>
    );

  if (reduced) {
    return <div key={category.id}>{content}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={category.id}
        className="will-change-[opacity,transform]"
        variants={categoryPanel}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={categoryPanelTransition}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}