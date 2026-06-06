import { HomeCta } from "@/components/home/HomeCta";
import { HomeStatsReviewsSection } from "@/components/home/HomeStatsReviewsSection";
import { CategoryServiceBrowser } from "@/components/home/CategoryServiceBrowser";
import { HomeHero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { PopularCategories } from "@/components/home/PopularCategories";
import { getHomepageContentSafe } from "@/lib/homepage/get-homepage-content";

export default async function HomePage() {
  const content = await getHomepageContentSafe();
  const { config } = content;

  return (
    <>
      {config.showHero ? <HomeHero hero={config} /> : null}
      {config.showPopularServices ? (
        <CategoryServiceBrowser categories={content.categoryBrowser} />
      ) : null}
      {config.showCategories ? (
        <PopularCategories
          categories={content.categories}
          section={{
            eyebrow: config.categoriesEyebrow,
            title: config.categoriesTitle,
            subtitle: config.categoriesSubtitle,
            ctaLabel: config.categoriesCtaLabel,
            ctaHref: config.categoriesCtaHref,
          }}
        />
      ) : null}
      {config.showHowItWorks ? (
        <HowItWorks
          section={{
            eyebrow: config.howItWorksEyebrow,
            title: config.howItWorksTitle,
            subtitle: config.howItWorksSubtitle,
            ctaLabel: config.howItWorksCtaLabel,
            ctaHref: config.howItWorksCtaHref,
          }}
          steps={content.howItWorksSteps}
        />
      ) : null}
      {config.showBottomCta ? (
        <HomeCta
          cta={{
            eyebrow: config.ctaEyebrow,
            title: config.ctaTitle,
            text: config.ctaText,
            primaryLabel: config.ctaPrimaryLabel,
            primaryHref: config.ctaPrimaryHref,
            secondaryLabel: config.ctaSecondaryLabel,
            secondaryHref: config.ctaSecondaryHref,
          }}
        />
      ) : null}
      <HomeStatsReviewsSection
        compactTop={config.showBottomCta}
        showReviews={config.showReviews}
        reviewsSection={{ title: config.reviewsTitle }}
        testimonials={content.testimonials}
      />
    </>
  );
}
