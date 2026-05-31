"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { panelPage } from "@/lib/motion/variants";
import { useMotionConfig } from "@/lib/motion/use-motion-config";
import { easeOut } from "@/lib/motion/transitions";

const panelPageTransition = {
  duration: 0.32,
  ease: easeOut,
};

export function ProviderPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { reduced } = useMotionConfig();

  if (reduced) {
    return <div className="w-full min-w-0">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className="w-full min-w-0"
        variants={panelPage}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={panelPageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
