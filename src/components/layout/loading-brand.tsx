"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { logoLoader, logoLoaderRing } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { APP_NAME } from "@/lib/constants";

const sizeMap = {
  sm: { width: 120, height: 36, className: "h-8", ring: "h-14 w-14" },
  md: { width: 150, height: 44, className: "h-10", ring: "h-20 w-20" },
  lg: { width: 180, height: 52, className: "h-12", ring: "h-28 w-28" },
} as const;

type BrandLoaderProps = {
  size?: keyof typeof sizeMap;
  showLabel?: boolean;
  label?: string;
  className?: string;
};

function LoadingDots() {
  return (
    <span className="ml-0.5 inline-flex items-end gap-1 pb-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-[#087a61]"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{
            duration: 0.75,
            repeat: Infinity,
            delay: i * 0.14,
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
  className = "",
}: BrandLoaderProps) {
  const { reduced } = useMotionConfig();
  const dims = sizeMap[size];

  return (
    <motion.div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`flex flex-col items-center justify-center gap-5 ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className={`relative flex items-center justify-center ${dims.ring}`}
        variants={logoLoader}
        initial="hidden"
        animate="visible"
      >
     
        <Image
          src="/logo.png"
          alt={APP_NAME}
          width={dims.width}
          height={dims.height}
          priority
          className={`relative z-10 w-auto object-contain ${dims.className}`}
        />
      </motion.div>

      {showLabel && (
        <motion.p
          className="flex items-center text-sm font-medium tracking-wide text-[#53635f]"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          {label}
          {!reduced && <LoadingDots />}
        </motion.p>
      )}
    </motion.div>
  );
}
