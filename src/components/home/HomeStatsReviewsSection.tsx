"use client";

import { Star } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { SectionReveal } from "@/components/motion/section-reveal";
import type { HomepageItemData } from "@/lib/homepage/defaults";
import { homeSectionX } from "@/lib/homepage/section-layout";

export function HomeStatsReviewsSection({
  reviewsSection,
  testimonials,
  showReviews,
  compactTop = false,
}: {
  reviewsSection: { title: string };
  testimonials: HomepageItemData[];
  showReviews: boolean;
  compactTop?: boolean;
}) {
  const hasReviews = showReviews && testimonials.length > 0;

  if (!hasReviews) return null;

  return (
    <SectionReveal
      className={`bg-white pb-12 ${homeSectionX}${compactTop ? " -mt-6" : ""}`}
    >
      <FadeIn className="mx-auto max-w-7xl mb-10">
        <h2 className="text-3xl font-black tracking-[-0.03em] text-[#083228]">
          {reviewsSection.title}
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-7xl grid gap-4 md:grid-cols-3 md:gap-5">
        {testimonials.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </SectionReveal>
  );
}

function ReviewCard({ review }: { review: HomepageItemData }) {
  const name = review.title ?? "";
  const rating = Math.min(review.rating ?? 5, 5);

  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.05)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e7f6f1] text-sm font-black text-[#087a61]">
            {name.charAt(0) || "M"}
          </div>

          <div className="min-w-0">
            <div className="truncate text-sm font-black text-[#083228]">
              {name || "Müşteri"}
            </div>
            {review.subtitle ? (
              <div className="truncate text-xs font-medium text-[#53635f]">
                {review.subtitle}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 text-amber-400">
          {Array.from({ length: rating }).map((_, index) => (
            <Star key={index} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
      </div>

      {review.body ? (
        <p className="line-clamp-3 text-sm leading-6 text-[#53635f]">
          {review.body}
        </p>
      ) : null}
    </article>
  );
}
