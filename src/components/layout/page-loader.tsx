"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLoader } from "@/components/layout/loading-brand";

const MIN_VISIBLE_MS = 1100;
const MAX_WAIT_MS = 4000;

export function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const startedAt = performance.now();
    let done = false;

    const hide = () => {
      if (done) return;
      done = true;
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      window.setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
      }, remaining);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    const fallback = window.setTimeout(hide, MAX_WAIT_MS);

    return () => {
      window.removeEventListener("load", hide);
      window.clearTimeout(fallback);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f7f7f3]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.div
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <BrandLoader size="lg" />
          </motion.div>

          <motion.div
            className="absolute bottom-0 left-0 h-0.5 origin-left bg-[#087a61]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{
              duration: MIN_VISIBLE_MS / 1000,
              ease: [0.4, 0, 0.2, 1],
            }}
            aria-hidden
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
