"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLoader } from "@/components/layout/loading-brand";

const MIN_VISIBLE_MS = 850;
const MAX_WAIT_MS = 3500;

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const startedAt = performance.now();
    let done = false;

    const tick = window.setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        return p + Math.random() * 8;
      });
    }, 120);

    const hide = () => {
      if (done) return;
      done = true;
      window.clearInterval(tick);
      setProgress(100);

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

      window.setTimeout(() => {
        setVisible(false);
        document.body.style.overflow = "";
      }, remaining + 180);
    };

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide, { once: true });
    }

    const fallback = window.setTimeout(hide, MAX_WAIT_MS);

    return () => {
      window.clearInterval(tick);
      window.removeEventListener("load", hide);
      window.clearTimeout(fallback);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {visible ? (
        <motion.div
          key="splash"
          className="fixed inset-0 z-200 flex flex-col items-center justify-center overflow-hidden bg-linear-to-b from-[#f8fcfa] via-[#f7f7f3] to-[#eef8f5]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#087a61]/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-16 bottom-1/4 h-64 w-64 rounded-full bg-[#087a61]/8 blur-3xl"
            aria-hidden
          />

          <motion.div
            className="fixed left-0 right-0 top-0 z-10 h-1 overflow-hidden bg-[#087a61]/10"
            aria-hidden
          >
            <motion.div
              className="h-full origin-left bg-linear-to-r from-[#066b54] via-[#087a61] to-[#12a384]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: Math.min(progress, 100) / 100 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
          </motion.div>

          <motion.div
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <BrandLoader
              size="lg"
              tagline="Güvenilir usta, kolay hizmet"
            />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
