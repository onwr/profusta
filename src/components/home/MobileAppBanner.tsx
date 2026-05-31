"use client";

import Image from "next/image";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import { homeSectionX } from "@/lib/homepage/section-layout";

type BannerCopy = {
  title: string;
  text: string;
  imageUrl: string;
};

export function MobileAppBanner({ banner }: { banner: BannerCopy }) {
  const titleLines = banner.title.split("\n").filter(Boolean);

  return (
    <SectionReveal className={`bg-white pb-12 ${homeSectionX}`}>
      <div className="mx-auto">
        <div className="relative min-h-[380px] overflow-hidden rounded-2xl bg-[#f4f8f6] sm:min-h-[420px] sm:rounded-[32px] lg:h-[440px]">
          <div className="grid h-full grid-cols-1 items-center gap-6 px-4 py-8 sm:grid-cols-[minmax(260px,42%)_1fr] sm:gap-4 sm:px-10 sm:py-0 lg:grid-cols-[400px_1fr_280px] lg:px-16 xl:grid-cols-[420px_1fr_340px] xl:px-20">
            <FadeIn
              variant="left"
              className="relative mx-auto h-[300px] w-[min(260px,75vw)] sm:mx-0 sm:h-[92%] sm:w-full sm:max-w-[400px]"
            >
              <Image
                src={banner.imageUrl}
                alt="ProfUsta Mobil"
                fill
                priority
                sizes="(max-width: 640px) 70vw, 400px"
                className="object-contain object-center drop-shadow-[0_20px_40px_rgba(8,50,40,0.12)]"
                unoptimized={banner.imageUrl.startsWith("http")}
              />
            </FadeIn>

            <FadeIn
              variant="right"
              className="flex flex-col justify-center sm:-ml-2 lg:pr-4"
              delay={0.1}
            >
              <h2 className="text-center text-[28px] font-black leading-[1.08] tracking-[-0.04em] text-[#083228] sm:text-left sm:text-[42px] lg:text-[50px] lg:leading-[1.02]">
                {titleLines.map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < titleLines.length - 1 ? (
                      <>
                        <br />
                        <br className="hidden sm:block" />
                      </>
                    ) : null}
                  </span>
                ))}
              </h2>

              <p className="mt-5 text-center text-[16px] leading-8 text-[#53635f] sm:mt-7 sm:text-left sm:text-[22px] sm:leading-10 lg:text-[24px]">
                {banner.text}
              </p>
            </FadeIn>
          </div>
        </div>
      </div>
    </SectionReveal>
  );
}
