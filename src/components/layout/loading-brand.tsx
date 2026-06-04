"use client";

import { motion } from "framer-motion";
import { logoLoader } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { SiteLogo } from "@/components/layout/site-logo";
import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    width: 120,
    height: 36,
    logoClass: "h-8",
    spinner: "h-8 w-8",
  },
  md: {
    width: 150,
    height: 44,
    logoClass: "h-10",
    spinner: "h-9 w-9",
  },
  lg: {
    width: 180,
    height: 52,
    logoClass: "h-12",
    spinner: "h-10 w-10",
  },
} as const;

type BrandLoaderProps = {
  size?: keyof typeof sizeMap;
  showLabel?: boolean;
  label?: string;
  tagline?: string;
  className?: string;
};

function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden>
      <span className="absolute inset-0 rounded-full border-2 border-[#087a61]/12" />
      <motion.span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#087a61] border-r-[#087a61]/35"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function LoadingDots() {
  return (
    <span className="ml-1 inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1 w-1 rounded-full bg-[#087a61]"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.85, 1, 0.85] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.16,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export function BrandLoader({
  size = "lg",
  showLabel = true,
  label = "Yükleniyor",
  tagline,
  className = "",
}: BrandLoaderProps) {
  const { reduced } = useMotionConfig();
  const dims = sizeMap[size];

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cn("flex flex-col items-center justify-center", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo — üst katman, spinner’dan ayrı */}
      <motion.div
        className="rounded-2xl bg-white px-5 py-4 shadow-[0_10px_40px_rgba(8,50,40,0.08)] ring-1 ring-black/5"
        variants={logoLoader}
        initial="hidden"
        animate="visible"
      >
        <SiteLogo
          width={dims.width}
          height={dims.height}
          priority
          className={dims.logoClass}
        />
      </motion.div>

      {/* Spinner — logo altında */}
      {!reduced ? (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <Spinner className={dims.spinner} />
        </motion.div>
      ) : null}

      {showLabel ? (
        <div className="mt-5 text-center">
          <motion.p
            className="flex items-center justify-center text-sm font-bold tracking-wide text-[#083228]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            {label}
            {!reduced ? <LoadingDots /> : null}
          </motion.p>
          {tagline ? (
            <motion.p
              className="mt-1.5 max-w-xs text-xs leading-5 text-[#53635f]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28, duration: 0.35 }}
            >
              {tagline}
            </motion.p>
          ) : null}
        </div>
      ) : null}
    </motion.div>
  );
}
