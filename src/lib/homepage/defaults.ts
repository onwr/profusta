import type { HomepageItemType } from "@/generated/prisma/client";

export type HomepageConfigData = {
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
  heroSearchPlaceholder: string;
  heroRating: string;
  heroRatingLabel: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  popularServicesEyebrow: string;
  popularServicesTitle: string;
  popularServicesSubtitle: string;
  popularServicesCtaLabel: string;
  popularServicesCtaHref: string;
  popularServicesLimit: number;
  categoriesEyebrow: string;
  categoriesTitle: string;
  categoriesSubtitle: string;
  categoriesCtaLabel: string;
  categoriesCtaHref: string;
  categoriesLimit: number;
  guaranteeTitle: string;
  guaranteeText: string;
  reviewsEyebrow: string;
  reviewsTitle: string;
  reviewsSubtitle: string;
  howItWorksEyebrow: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  howItWorksCtaLabel: string;
  howItWorksCtaHref: string;
  mobileTitle: string;
  mobileText: string;
  mobileImageUrl: string;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaText: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  showHero: boolean;
  showPopularServices: boolean;
  showCategories: boolean;
  showReviews: boolean;
  showMobileBanner: boolean;
  showHowItWorks: boolean;
  showBottomCta: boolean;
};

export type HomepageItemData = {
  id: string;
  type: HomepageItemType;
  sortOrder: number;
  isActive: boolean;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  body: string | null;
  priceLabel: string | null;
  icon: string | null;
  href: string | null;
  stepNumber: string | null;
  bullets: string[] | null;
  rating: number | null;
  serviceId: string | null;
  listingId: string | null;
  imageUrl: string | null;
  /** Popüler hizmet kartında kapak (ilan görseli, kategori kapağı veya imageUrl) */
  coverImageUrl?: string | null;
};

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfigData = {
  heroBadge: "ProfUsta güvencesiyle",
  heroTitle:
    "Ev işleri için\ngüvenilir\nustalar,\npratik\nçözümler.",
  heroSubtitle:
    "Elektrikten tesisata, mobilya montajından boyaya tüm işlerinizde yanınızdayız.",
  heroImageUrl: "/hero.png",
  heroSearchPlaceholder: "Hangi hizmete ihtiyacınız var?",
  heroRating: "4.9 / 5",
  heroRatingLabel: "10.000+ mutlu müşteri",
  heroPrimaryCtaLabel: "Hemen Teklif Al",
  heroPrimaryCtaHref: "/talep-olustur",
  heroSecondaryCtaLabel: "Ustaları Keşfet",
  heroSecondaryCtaHref: "/ustalar",
  popularServicesEyebrow: "Hizmetler",
  popularServicesTitle: "Popüler Hizmetler",
  popularServicesSubtitle: "En çok tercih edilen hizmetlere göz atın.",
  popularServicesCtaLabel: "Tüm Hizmetleri Gör",
  popularServicesCtaHref: "/hizmetler",
  popularServicesLimit: 8,
  categoriesEyebrow: "Kategoriler",
  categoriesTitle: "Popüler Hizmet Kategorileri",
  categoriesSubtitle: "İhtiyacınıza uygun hizmet kategorisini seçin.",
  categoriesCtaLabel: "Tüm Kategorileri Gör",
  categoriesCtaHref: "/hizmetler",
  categoriesLimit: 8,
  guaranteeTitle: "Güvencemizle Hizmet Alın",
  guaranteeText:
    "Tüm ödemeler ProfUsta güvencesi altında. Memnun kalmazsanız ücret iadesi alırsınız.",
  reviewsEyebrow: "Yorumlar",
  reviewsTitle: "Müşterilerimiz Ne Diyor?",
  reviewsSubtitle: "Gerçek müşterilerimizin gerçek yorumları",
  howItWorksEyebrow: "Süreç",
  howItWorksTitle: "Nasıl Çalışır?",
  howItWorksSubtitle: "Dört basit adımda işinizi güvenle tamamlayın.",
  howItWorksCtaLabel: "Detaylı incele",
  howItWorksCtaHref: "/nasil-calisir",
  mobileTitle: "ProfUsta Mobil Uygulaması\nile her şey elinizin altında!",
  mobileText:
    "Hemen indirin, hızlıca teklif alın ve ustalarla kolayca iletişim kurun.",
  mobileImageUrl: "/mobil.png",
  ctaEyebrow: "ProfUsta güvencesi",
  ctaTitle: "Hizmete mi ihtiyacınız var?",
  ctaText:
    "Dakikalar içinde talebinizi oluşturun, güvenilir ustalardan ücretsiz teklif alın. Ya da usta olarak aramıza katılın, yeni müşterilere ulaşın.",
  ctaPrimaryLabel: "Hemen Teklif Al",
  ctaPrimaryHref: "/talep-olustur",
  ctaSecondaryLabel: "Usta Olarak Katıl",
  ctaSecondaryHref: "/usta-basvuru",
  showHero: true,
  showPopularServices: true,
  showCategories: true,
  showReviews: true,
  showMobileBanner: true,
  showHowItWorks: true,
  showBottomCta: true,
};

/** Popüler hizmetler anasayfada DB kategorilerinden üretilir; burada yalnızca diğer bölümler için varsayılanlar. */
export const DEFAULT_HOMEPAGE_ITEMS: Omit<
  HomepageItemData,
  "id" | "serviceId" | "listingId" | "imageUrl"
>[] = [
  { type: "STAT", sortOrder: 0, isActive: true, title: "1M+", subtitle: "Tamamlanan İş", description: null, body: null, priceLabel: null, icon: null, href: null, stepNumber: null, bullets: null, rating: null },
  { type: "STAT", sortOrder: 1, isActive: true, title: "50K+", subtitle: "Mutlu Müşteri", description: null, body: null, priceLabel: null, icon: null, href: null, stepNumber: null, bullets: null, rating: null },
  { type: "STAT", sortOrder: 2, isActive: true, title: "10K+", subtitle: "Güvenilir Usta", description: null, body: null, priceLabel: null, icon: null, href: null, stepNumber: null, bullets: null, rating: null },
  { type: "STAT", sortOrder: 3, isActive: true, title: "4.9/5", subtitle: "Ortalama Puan", description: null, body: null, priceLabel: null, icon: null, href: null, stepNumber: null, bullets: null, rating: null },
  {
    type: "TESTIMONIAL",
    sortOrder: 0,
    isActive: true,
    title: "Elif Y.",
    subtitle: "Mobilya Montajı",
    description: null,
    body: "Mobilya montajı için Ahmet ustadan yardım aldım. Hem çok hızlı hem de çok titiz çalıştı. Kesinlikle tavsiye ederim!",
    priceLabel: null,
    icon: null,
    href: null,
    stepNumber: null,
    bullets: null,
    rating: 5,
  },
  {
    type: "TESTIMONIAL",
    sortOrder: 1,
    isActive: true,
    title: "Mehmet A.",
    subtitle: "Elektrik Yardımı",
    description: null,
    body: "Elektrik arızamı aynı gün çözdü. Fiyatı uygun, işi kaliteli. ProfUsta sayesinde güvenilir ustaya kolayca ulaştım.",
    priceLabel: null,
    icon: null,
    href: null,
    stepNumber: null,
    bullets: null,
    rating: 5,
  },
  {
    type: "TESTIMONIAL",
    sortOrder: 2,
    isActive: true,
    title: "Seda K.",
    subtitle: "Ev Temizliği",
    description: null,
    body: "Ev temizliği hizmeti aldım, evim pırıl pırıl oldu. Çok memnun kaldım, düzenli olarak devam edeceğim.",
    priceLabel: null,
    icon: null,
    href: null,
    stepNumber: null,
    bullets: null,
    rating: 5,
  },
  {
    type: "HOW_IT_WORKS_STEP",
    sortOrder: 0,
    isActive: true,
    title: "İhtiyacınızı Belirtin",
    subtitle: null,
    description: "Hangi hizmete ihtiyacınız olduğunu ve detayları paylaşın.",
    body: null,
    priceLabel: null,
    icon: "ClipboardEdit",
    href: null,
    stepNumber: "1",
    bullets: null,
    rating: null,
  },
  {
    type: "HOW_IT_WORKS_STEP",
    sortOrder: 1,
    isActive: true,
    title: "Teklifleri Karşılaştırın",
    subtitle: null,
    description: "Ustalar size teklif gönderir, fiyat ve yorumları karşılaştırın.",
    body: null,
    priceLabel: null,
    icon: "GitCompareArrows",
    href: null,
    stepNumber: "2",
    bullets: null,
    rating: null,
  },
  {
    type: "HOW_IT_WORKS_STEP",
    sortOrder: 2,
    isActive: true,
    title: "Ustanızı Seçin",
    subtitle: null,
    description: "Size en uygun ustayı seçin ve işlemi başlatın.",
    body: null,
    priceLabel: null,
    icon: "Handshake",
    href: null,
    stepNumber: "3",
    bullets: null,
    rating: null,
  },
  {
    type: "HOW_IT_WORKS_STEP",
    sortOrder: 3,
    isActive: true,
    title: "İşiniz Tamamlansın",
    subtitle: null,
    description: "İşiniz tamamlandığında değerlendirme yapın.",
    body: null,
    priceLabel: null,
    icon: "PartyPopper",
    href: null,
    stepNumber: "4",
    bullets: null,
    rating: null,
  },
];
