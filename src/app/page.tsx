import { HomeCta } from "@/components/home/HomeCta";
import { HomeHero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MobileAppBanner } from "@/components/home/MobileAppBanner";
import { PopularCategories } from "@/components/home/PopularCategories";
import { PopularServices } from "@/components/home/PopulerServices";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { getHomepageContent } from "@/lib/homepage/get-homepage-content";

export default async function HomePage() {
  const content = await getHomepageContent();
  const { config } = content;

  return (
    <>
      {config.showHero ? <HomeHero hero={config} /> : null}
      {config.showPopularServices ? (
        <PopularServices
          section={{
            eyebrow: config.popularServicesEyebrow,
            title: config.popularServicesTitle,
            subtitle: config.popularServicesSubtitle,
            ctaLabel: config.popularServicesCtaLabel,
            ctaHref: config.popularServicesCtaHref,
          }}
          items={content.featuredServices}
        />
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
          guarantee={{
            title: config.guaranteeTitle,
            text: config.guaranteeText,
          }}
          stats={content.stats}
        />
      ) : null}
      {config.showReviews ? (
        <CustomerReviews
          section={{
            eyebrow: config.reviewsEyebrow,
            title: config.reviewsTitle,
            subtitle: config.reviewsSubtitle,
          }}
          testimonials={content.testimonials}
        />
      ) : null}
      {config.showMobileBanner ? (
        <MobileAppBanner
          banner={{
            title: config.mobileTitle,
            text: config.mobileText,
            imageUrl: config.mobileImageUrl,
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
    </>
  );
}
