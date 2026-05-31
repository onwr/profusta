"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { cn } from "@/lib/utils";

type StaggerChildrenProps = {
  children: React.ReactNode;
  className?: string;
};

export function StaggerChildren({ children, className }: StaggerChildrenProps) {
  const { reduced, viewport, fastTransition, initial, animate } =
    useMotionConfig();

  return (
    <motion.div
      className={cn(className)}
      variants={staggerContainer}
      initial={initial}
      whileInView={animate}
      viewport={viewport}
      transition={fastTransition}
      {...(reduced ? { animate: "visible" } : {})}
    >
      {children}
    </motion.div>
  );
}

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  const { fastTransition } = useMotionConfig();

  return (
    <motion.div className={cn(className)} variants={staggerItem} transition={fastTransition}>
      {children}
    </motion.div>
  );
}
