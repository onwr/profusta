"use client";

import { ShieldCheck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import type { HomepageItemData } from "@/lib/homepage/defaults";
import { homeSectionX } from "@/lib/homepage/section-layout";

export function HomeGuaranteeStats({
  guarantee,
  stats,
  compactTop = false,
}: {
  guarantee: { title: string; text: string };
  stats: HomepageItemData[];
  compactTop?: boolean;
}) {
  if (stats.length === 0 && !guarantee.title && !guarantee.text) {
    return null;
  }

  return (
    <SectionReveal
      className={`bg-white pb-20 ${homeSectionX}${compactTop ? " -mt-10" : ""}`}
    >
      <FadeIn
        className="-mt-8 overflow-hidden rounded-2xl border border-[#e8ecf0] bg-[#f8fafb] px-4 py-6 sm:rounded-3xl sm:px-8 sm:py-8"
        delay={0.1}
      >
        <div className="flex min-w-0 flex-col gap-8 lg:flex-row lg:items-center lg:gap-6 xl:gap-10">
          {stats.length > 0 ? (
            <div className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 lg:flex-1">
              {stats.map((stat) => (
                <Stat
                  key={stat.id}
                  value={stat.title ?? ""}
                  label={stat.subtitle ?? ""}
                />
              ))}
            </div>
          ) : null}

          <div
            className={`flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 ${
              stats.length > 0
                ? "border-t border-[#cbd5e1]/40 pt-6 lg:w-[min(100%,26rem)] lg:shrink-0 lg:border-t-0 lg:pt-0 xl:w-[min(100%,28rem)]"
                : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-black text-[#0f1419]">
                {guarantee.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#64748b] sm:max-w-[360px]">
                {guarantee.text}
              </p>
            </div>

            <div className="grid h-16 w-16 shrink-0 place-items-center self-start rounded-full bg-[#e2e8f0] text-[#334155] sm:h-20 sm:w-20 sm:self-center">
              <ShieldCheck className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
          </div>
        </div>
      </FadeIn>
    </SectionReveal>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 text-center sm:text-left">
      <div className="mx-auto mb-2 h-2 w-2 rounded-full bg-[#94a3b8] sm:mx-0 sm:mb-3" />
      <div className="text-xl font-black text-[#0f1419] sm:text-2xl">{value}</div>
      <div className="mt-1 text-xs font-medium leading-snug text-[#64748b] sm:text-sm">
        {label}
      </div>
    </div>
  );
}
