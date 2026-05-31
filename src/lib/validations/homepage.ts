import { z } from "zod";

const optionalUrl = z.string().max(500).optional().nullable();

export const homepageConfigSchema = z.object({
  heroBadge: z.string().max(120).optional(),
  heroTitle: z.string().max(2000).optional(),
  heroSubtitle: z.string().max(2000).optional(),
  heroImageUrl: optionalUrl,
  heroSearchPlaceholder: z.string().max(200).optional(),
  heroRating: z.string().max(50).optional(),
  heroRatingLabel: z.string().max(120).optional(),
  heroPrimaryCtaLabel: z.string().max(80).optional(),
  heroPrimaryCtaHref: z.string().max(200).optional(),
  heroSecondaryCtaLabel: z.string().max(80).optional(),
  heroSecondaryCtaHref: z.string().max(200).optional(),
  popularServicesEyebrow: z.string().max(80).optional(),
  popularServicesTitle: z.string().max(200).optional(),
  popularServicesSubtitle: z.string().max(500).optional(),
  popularServicesCtaLabel: z.string().max(80).optional(),
  popularServicesCtaHref: z.string().max(200).optional(),
  popularServicesLimit: z.number().int().min(1).max(24).optional(),
  categoriesEyebrow: z.string().max(80).optional(),
  categoriesTitle: z.string().max(200).optional(),
  categoriesSubtitle: z.string().max(500).optional(),
  categoriesCtaLabel: z.string().max(80).optional(),
  categoriesCtaHref: z.string().max(200).optional(),
  categoriesLimit: z.number().int().min(1).max(24).optional(),
  guaranteeTitle: z.string().max(200).optional(),
  guaranteeText: z.string().max(2000).optional(),
  reviewsEyebrow: z.string().max(80).optional(),
  reviewsTitle: z.string().max(200).optional(),
  reviewsSubtitle: z.string().max(500).optional(),
  howItWorksEyebrow: z.string().max(80).optional(),
  howItWorksTitle: z.string().max(200).optional(),
  howItWorksSubtitle: z.string().max(500).optional(),
  howItWorksCtaLabel: z.string().max(80).optional(),
  howItWorksCtaHref: z.string().max(200).optional(),
  mobileTitle: z.string().max(500).optional(),
  mobileText: z.string().max(2000).optional(),
  mobileImageUrl: optionalUrl,
  ctaEyebrow: z.string().max(80).optional(),
  ctaTitle: z.string().max(200).optional(),
  ctaText: z.string().max(2000).optional(),
  ctaPrimaryLabel: z.string().max(80).optional(),
  ctaPrimaryHref: z.string().max(200).optional(),
  ctaSecondaryLabel: z.string().max(80).optional(),
  ctaSecondaryHref: z.string().max(200).optional(),
  showHero: z.boolean().optional(),
  showPopularServices: z.boolean().optional(),
  showCategories: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  showMobileBanner: z.boolean().optional(),
  showHowItWorks: z.boolean().optional(),
  showBottomCta: z.boolean().optional(),
});

export const homepageItemTypeSchema = z.enum([
  "FEATURED_SERVICE",
  "STAT",
  "TESTIMONIAL",
  "HOW_IT_WORKS_STEP",
]);

export const homepageItemCreateSchema = z.object({
  type: homepageItemTypeSchema,
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  title: z.string().max(200).optional().nullable(),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable(),
  body: z.string().max(5000).optional().nullable(),
  priceLabel: z.string().max(80).optional().nullable(),
  icon: z.string().max(80).optional().nullable(),
  href: z.string().max(500).optional().nullable(),
  stepNumber: z.string().max(10).optional().nullable(),
  bullets: z.array(z.string().max(500)).optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  serviceId: z.string().cuid().optional().nullable(),
  listingId: z.string().cuid().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
});

export const homepageItemUpdateSchema = homepageItemCreateSchema
  .partial()
  .extend({
    type: homepageItemTypeSchema.optional(),
  });
