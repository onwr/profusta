"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { HeaderLocationPicker } from "@/components/layout/header-location-picker";
import {
  headerBar,
  headerStaggerContainer,
  headerStaggerItem,
  mobileMenu,
} from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { HeaderAuthActions } from "@/components/layout/header-auth-actions";
import type { HeaderUser } from "@/lib/auth/header-user";

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

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-black/5 bg-[#f7f7f3]/95 backdrop-blur-md"
      variants={headerBar}
      initial={initial}
      animate={animate}
      transition={fastTransition}
    >
      <motion.div
        className="flex h-[72px] w-full items-center justify-between px-8 sm:px-12 lg:px-16 xl:px-20 2xl:px-24"
        variants={headerStaggerContainer}
        initial={initial}
        animate={animate}
      >
        <motion.div variants={headerStaggerItem} transition={fastTransition}>
          <Link href={ROUTES.home} className="flex items-center">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={150}
              height={44}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
        </motion.div>

        <motion.nav
          className="hidden items-center gap-10 lg:flex"
          variants={headerStaggerContainer}
          initial={initial}
          animate={animate}
        >
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              variants={headerStaggerItem}
              transition={fastTransition}
            >
              <Link
                href={item.href}
                className="text-[15px] font-bold text-[#083228] transition hover:text-[#087a61]"
              >
                {item.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="hidden items-center gap-3 lg:flex"
          variants={headerStaggerContainer}
          initial={initial}
          animate={animate}
        >
          {user?.role === "CUSTOMER" ? (
            <motion.div variants={headerStaggerItem} transition={fastTransition}>
              <Link
                href={ROUTES.createRequest}
                className="inline-flex h-10 items-center rounded-full border border-[#087a61]/20 bg-[#eef8f5] px-4 text-sm font-bold text-[#087a61] transition hover:bg-[#dff3ec]"
              >
                Talep Oluştur
              </Link>
            </motion.div>
          ) : null}

          <motion.div variants={headerStaggerItem} transition={fastTransition}>
            <HeaderLocationPicker variant="desktop" />
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            variants={headerStaggerItem}
            transition={fastTransition}
          >
            <HeaderAuthActions user={user} variant="desktop" />
          </motion.div>
        </motion.div>

        <motion.button
          type="button"
          variants={headerStaggerItem}
          transition={fastTransition}
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#083228] ring-1 ring-black/10 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            variants={mobileMenu}
            initial={reduced ? false : "hidden"}
            animate="visible"
            exit={reduced ? undefined : "exit"}
            transition={fastTransition}
            className="overflow-hidden border-t border-black/5 bg-[#f7f7f3] px-6 py-5 shadow-xl lg:hidden"
          >
            <motion.div
              className="flex flex-col gap-3"
              variants={headerStaggerContainer}
              initial={initial}
              animate={animate}
            >
              <motion.div variants={headerStaggerItem} transition={fastTransition}>
                <HeaderLocationPicker variant="mobile" />
              </motion.div>

              {navItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={headerStaggerItem}
                  transition={fastTransition}
                >
                  <Link
                    href={item.href}
                    onClick={closeMobile}
                    className="block rounded-2xl px-4 py-3 text-sm font-bold text-[#083228] transition hover:bg-white hover:text-[#087a61]"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div variants={headerStaggerItem} transition={fastTransition}>
                <HeaderAuthActions
                  user={user}
                  variant="mobile"
                  onNavigate={closeMobile}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
