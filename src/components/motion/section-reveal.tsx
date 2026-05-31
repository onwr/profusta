"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { cn } from "@/lib/utils";

type SectionRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div";
};

export function SectionReveal({
  children,
  className,
  as = "section",
}: SectionRevealProps) {
  const { reduced, viewport, transition, initial, animate } = useMotionConfig();
  const Component = motion[as === "section" ? "section" : "div"];

  return (
    <Component
      className={cn(className)}
      variants={fadeUp}
      initial={initial}
      whileInView={animate}
      viewport={viewport}
      transition={transition}
      {...(reduced ? { animate: "visible" } : {})}
    >
      {children}
    </Component>
  );
}
