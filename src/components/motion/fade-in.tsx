"use client";

import { motion, type Variants } from "framer-motion";
import { fadeIn, fadeLeft, fadeRight, fadeUp } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { cn } from "@/lib/utils";

const variantMap = {
  up: fadeUp,
  in: fadeIn,
  left: fadeLeft,
  right: fadeRight,
} as const;

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof variantMap;
  customVariants?: Variants;
  delay?: number;
};

export function FadeIn({
  children,
  className,
  variant = "up",
  customVariants,
  delay = 0,
}: FadeInProps) {
  const { reduced, viewport, transition, initial, animate } = useMotionConfig();
  const variants = customVariants ?? variantMap[variant];

  return (
    <motion.div
      className={cn(className)}
      variants={variants}
      initial={initial}
      whileInView={animate}
      viewport={viewport}
      transition={{ ...transition, delay: reduced ? 0 : delay }}
      {...(reduced ? { animate: "visible" } : {})}
    >
      {children}
    </motion.div>
  );
}
