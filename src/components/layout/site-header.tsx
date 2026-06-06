"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  headerBar,
  headerStaggerContainer,
  headerStaggerItem,
  mobileMenu,
} from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { ROUTES } from "@/lib/constants";
import { HeaderAuthActions } from "@/components/layout/header-auth-actions";
import { SiteLogo } from "@/components/layout/site-logo";
import type { HeaderUser } from "@/lib/auth/header-user";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Ustalar", href: "/ustalar" },
  { label: "İlanlar", href: "/ilanlar" },
  { label: "Nasıl Çalışır?", href: ROUTES.static.howItWorks },
];

type SiteHeaderProps = {
  user: HeaderUser | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { initial, animate, fastTransition, reduced } = useMotionConfig();

  const closeMobile = () => setMobileOpen(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobile();
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <motion.header
      className="sticky top-0 z-50 w-full min-w-0 border-b border-black/5 bg-white"
      variants={headerBar}
      initial={initial}
      animate={animate}
      transition={fastTransition}
    >
      <motion.div
        className="mx-auto flex h-16 w-full min-w-0 max-w-screen-2xl items-center justify-between gap-3 px-4 sm:h-[72px] sm:gap-4 sm:px-6 lg:h-[76px] lg:px-8 xl:px-12"
        variants={headerStaggerContainer}
        initial={initial}
        animate={animate}
      >
        <motion.div
          variants={headerStaggerItem}
          transition={fastTransition}
          className="flex min-w-0 shrink items-center"
        >
          <Link
            href={ROUTES.home}
            className="inline-flex min-w-0 max-w-[140px] items-center sm:max-w-[160px]"
            onClick={closeMobile}
          >
            <SiteLogo
              width={120}
              height={34}
              priority
              className="h-7 max-w-full sm:h-8"
            />
          </Link>
        </motion.div>

        <motion.nav
          className="hidden min-w-0 flex-1 items-center justify-center gap-8 xl:gap-12 lg:flex"
          variants={headerStaggerContainer}
          initial={initial}
          animate={animate}
          aria-label="Ana menü"
        >
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              variants={headerStaggerItem}
              transition={fastTransition}
            >
              <Link
                href={item.href}
                className="whitespace-nowrap text-[15px] font-semibold text-[#083228] transition hover:text-[#087A61]"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="hidden shrink-0 items-center justify-end gap-2 lg:flex lg:gap-3"
          variants={headerStaggerContainer}
          initial={initial}
          animate={animate}
        >
          {user?.role === "CUSTOMER" ? (
            <motion.div variants={headerStaggerItem} transition={fastTransition}>
              <Link
                href={ROUTES.createRequest}
                className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#087A61] px-5 text-sm font-black text-white transition hover:bg-[#06644f] xl:px-6"
              >
                Talep Oluştur
              </Link>
            </motion.div>
          ) : null}

          <motion.div variants={headerStaggerItem} transition={fastTransition}>
            <HeaderAuthActions user={user} variant="desktop" />
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          variants={headerStaggerItem}
          transition={fastTransition}
          onClick={() => setMobileOpen((value) => !value)}
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#083228] ring-1 ring-black/10 transition lg:hidden sm:h-11 sm:w-11",
            mobileOpen
              ? "bg-[#087A61] text-white ring-[#087A61]/20"
              : "bg-[#f7f7f3] hover:bg-[#eef8f5]",
          )}
          aria-expanded={mobileOpen}
          aria-controls="mobile-site-menu"
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" strokeWidth={2.25} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2.25} />
          )}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.button
              type="button"
              key="mobile-backdrop"
              aria-label="Menüyü kapat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fastTransition}
              className="fixed inset-0 z-40 bg-[#083228]/25 backdrop-blur-[2px] lg:hidden"
              onClick={closeMobile}
            />

            <motion.div
              id="mobile-site-menu"
              key="mobile-menu"
              variants={mobileMenu}
              initial={reduced ? false : "hidden"}
              animate="visible"
              exit={reduced ? undefined : "exit"}
              transition={fastTransition}
              className="relative z-50 overflow-hidden border-t border-black/5 bg-white shadow-[0_20px_50px_rgba(8,50,40,0.12)] lg:hidden"
            >
              <div className="mx-auto max-h-[min(72dvh,calc(100dvh-4.5rem))] w-full max-w-screen-2xl overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                <motion.nav
                  className="flex flex-col gap-1"
                  variants={headerStaggerContainer}
                  initial={initial}
                  animate={animate}
                  aria-label="Mobil menü"
                >
                  {navItems.map((item) => (
                    <motion.div
                      key={item.href}
                      variants={headerStaggerItem}
                      transition={fastTransition}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMobile}
                        className="flex min-h-12 items-center rounded-xl px-4 text-[15px] font-bold text-[#083228] transition active:bg-[#f0f7f4] hover:bg-[#f7f7f3] hover:text-[#087A61]"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </motion.nav>

                <motion.div
                  variants={headerStaggerItem}
                  transition={fastTransition}
                  className="mt-4 border-t border-black/5 pt-4"
                >
                  <HeaderAuthActions
                    user={user}
                    variant="mobile"
                    onNavigate={closeMobile}
                  />
                </motion.div>
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
