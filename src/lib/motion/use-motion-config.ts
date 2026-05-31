"use client";

import { useReducedMotion } from "framer-motion";
import { noMotionTransition } from "@/lib/motion/transitions";
import {
  defaultTransition,
  fastTransition,
  heroTransition,
} from "@/lib/motion/transitions";

export function useMotionConfig() {
  const reduced = useReducedMotion() ?? false;

  return {
    reduced,
    viewport: { once: true as const, margin: "-80px" as const },
    transition: reduced ? noMotionTransition : defaultTransition,
    fastTransition: reduced ? noMotionTransition : fastTransition,
    heroTransition: reduced ? noMotionTransition : heroTransition,
    initial: reduced ? ("visible" as const) : ("hidden" as const),
    animate: "visible" as const,
  };
}
