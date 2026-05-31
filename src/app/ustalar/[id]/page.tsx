import Image from "next/image";
import Link from "next/link";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { getCategoryIcon } from "@/lib/category-icons";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { createHash } from "crypto";
import type { ComponentType, ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Eye,
  FileBadge,
  HeartHandshake,
  ImageIcon,
  MapPin,
  MessageSquare,
  Send,
  ShieldCheck,
  Star,
  Timer,
  Trophy,
  Zap,
} from "lucide-react";
import { ReadonlyLocationMap } from "@/components/geo/readonly-location-map";
import { FavoriteButton } from "@/components/providers/favorite-button";
import { ProviderProfileTabs } from "@/components/providers/provider-profile-tabs";
import { ProviderShareButton } from "@/components/providers/provider-share-button";
import { StartConversationButton } from "@/components/messages/start-conversation-button";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ListingStatus,
  OrderStatus,
  ProviderStatus,
} from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { getProviderRating } from "@/lib/reviews/aggregate";

type Props = { params: Promise<{ id: string }> };

export default async function ProviderPublicPage({ params }: Props) {
  const { id: slugOrId } = await params;
  const provider = await db.provider.findFirst({
    where: {
      status: ProviderStatus.APPROVED,
      OR: [{ id: slugOrId }, { slug: slugOrId }],
    },
    include: {
      user: { select: { fullName: true, avatarUrl: true, createdAt: true } },
      categories: true,
      serviceAreas: { where: { isActive: true } },
      documents: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      faqs: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      listings: {
        where: { status: ListingStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          category: { select: { name: true, slug: true } },
          images: { orderBy: { sortOrder: "asc" }, take: 6 },
        },
      },
      reviews: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: { select: { fullName: true, avatarUrl: true } },
          order: { select: { title: true } },
        },
      },
    },
  });

  if (!provider) notFound();

  const categorySlugs = provider.categories.map((category) => category.categorySlug);
  const categoryMeta =
    categorySlugs.length > 0
      ? await db.category.findMany({
          where: { slug: { in: categorySlugs } },
          include: {
            services: {
              where: { isActive: true },
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        })
      : [];
  const completedOrderCount = await db.order.count({
    where: {
      providerId: provider.id,
      status: {
        in: [
          OrderStatus.COMPLETED,
          OrderStatus.PAYOUT_PENDING,
          OrderStatus.PAYOUT_COMPLETED,
        ],
      },
    },
  });
  const { ratingAvg, reviewCount } = await getProviderRating(provider.id);
  const user = await getCurrentUser();
  const isOwnProviderProfile = user?.provider?.id === provider.id;
  await trackProviderProfileView({
    providerId: provider.id,
    viewerId: user?.id,
    skip: isOwnProviderProfile,
  });
  const [profileViews, latestProviderMessage, conversationsForResponse] =
    await Promise.all([
      db.providerProfileView.count({
        where: { providerId: provider.id },
      }),
      db.message.findFirst({
        where: { senderId: provider.userId },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      db.conversation.findMany({
        where: { providerId: provider.id },
        select: {
          customerId: true,
          messages: {
            orderBy: { createdAt: "asc" },
            select: { senderId: true, createdAt: true },
          },
        },
      }),
    ]);
  const responseStats = getProviderResponseStats(
    conversationsForResponse,
    provider.userId,
  );
  const responseLabel = responseStats.averageMinutes
    ? formatDurationMinutes(responseStats.averageMinutes)
    : "Henüz veri yok";
  const responseRateLabel =
    responseStats.customerConversationCount > 0
      ? `%${responseStats.responseRate}`
      : "Veri yok";
  const lastActiveLabel = latestProviderMessage
    ? formatRelativeTime(latestProviderMessage.createdAt)
    : formatRelativeTime(provider.updatedAt);
  const favorited =
    user?.role === "CUSTOMER"
      ? !!(await db.favorite.findUnique({
          where: {
            customerId_providerId: {
              customerId: user.id,
              providerId: provider.id,
            },
          },
        }))
      : false;
  const primaryListing = provider.listings[0];
  const coverImage = primaryListing?.images[0]?.url;
  const primaryCategory =
    primaryListing?.category.name ??
    categoryMeta[0]?.name ??
    formatCategory(provider.categories[0]?.categorySlug) ??
    "Profesyonel Usta";
  const providerServiceGroups =
    categoryMeta.length > 0
      ? categoryMeta.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          coverImageUrl: category.coverImageUrl,
          icon: category.icon,
          services: category.services.map((service) => ({
            id: service.id,
            name: service.name,
            description: service.description,
          })),
        }))
      : provider.categories.map((category) => ({
          id: category.id,
          name: formatCategory(category.categorySlug) ?? category.categorySlug,
          slug: category.categorySlug,
          coverImageUrl: null,
          icon: null,
          services: [],
        }));
  const primaryCategorySlug =
    primaryListing?.category.slug ?? providerServiceGroups[0]?.slug;
  const createRequestHref = `${ROUTES.createRequest}?provider=${encodeURIComponent(
    provider.id,
  )}${
    primaryCategorySlug
      ? `&kategori=${encodeURIComponent(primaryCategorySlug)}`
      : ""
  }`;
  const dynamicBadges = getProviderBadges({
    isPro: provider.isPro,
    ratingAvg,
    reviewCount,
    completedOrderCount,
    cancelCount: provider.cancelCount,
    documentCount: provider.documents.length,
    listingCount: provider.listings.length,
  });

  return (
    <div className="bg-[#f5f7fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href={ROUTES.providers}
          className="mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#53635f] transition hover:text-[#087a61]"
        >
          <ChevronLeft className="h-4 w-4" />
          Ustalara Geri Dön
        </Link>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="rounded-[32px] border border-black/5 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.08)] sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="relative grid h-[116px] w-[116px] shrink-0 place-items-center overflow-hidden rounded-[30px] bg-[#eef8f5] text-4xl font-black text-[#087a61] shadow-[0_18px_42px_rgba(15,23,42,0.14)] ring-4 ring-white">
                {provider.user.avatarUrl ? (
                  <Image
                    src={provider.user.avatarUrl}
                    alt={provider.user.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  provider.user.fullName.charAt(0)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#087a61]">
                    Usta Profili
                  </span>
                  {isOwnProviderProfile ? (
                    <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black text-[#087a61]">
                      Profiliniz
                    </span>
                  ) : null}
                  {provider.isPro ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black text-amber-700">
                      PRO USTA
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="wrap-break-word text-4xl font-black leading-[1.02] tracking-[-0.04em] text-[#083228] sm:text-5xl">
                    {provider.user.fullName}
                  </h1>
                  <BadgeCheck className="h-6 w-6 fill-[#087a61] text-white" />
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {provider.slug ? (
                    <span className="rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-black text-[#53635f]">
                      @{provider.slug}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#f5f7fb] px-3 py-1.5 text-xs font-black text-[#083228]">
                    {primaryCategory}
                  </span>
                </div>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#53635f]">
                  {provider.bio ??
                    `${primaryCategory} alanında profesyonel hizmet, hızlı iletişim ve müşteri memnuniyeti odaklı çalışma.`}
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <HeroMetric
                icon={Star}
                label="Puan"
                value={ratingAvg ? String(ratingAvg) : "Yeni"}
                helper={reviewCount > 0 ? `${reviewCount} yorum` : "Değerlendirme bekliyor"}
              />
              <HeroMetric
                icon={MapPin}
                label="Konum"
                value={formatLocation(provider.baseCity, provider.baseDistrict)}
                helper="Hizmet bölgesi"
              />
              <HeroMetric
                icon={BriefcaseBusiness}
                label="İş Geçmişi"
                value={String(completedOrderCount)}
                helper="Tamamlanan iş"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {isOwnProviderProfile ? (
                <Link
                  href={ROUTES.provider.profile}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#083228] px-5 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5"
                >
                  Profili Düzenle
                </Link>
              ) : null}
              <StartConversationButton
                providerId={provider.id}
                listingId={primaryListing?.id}
                className="h-12 rounded-2xl border border-black/10 bg-white px-5 text-sm font-black text-[#083228] shadow-sm hover:bg-[#f6f8fb]"
              />
              <Link
                href={createRequestHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-6 text-sm font-black text-white shadow-[0_12px_28px_rgba(8,122,97,.22)] transition hover:-translate-y-0.5 hover:bg-[#06644f]"
              >
                <Send className="h-4 w-4" />
                Teklif İste
              </Link>
              {user?.role === "CUSTOMER" || user?.role === "ADMIN" ? (
                <FavoriteButton
                  providerId={provider.id}
                  initialFavorited={favorited}
                />
              ) : null}
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-[32px] border border-black/5 bg-[#06291f] shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            {coverImage ? (
              <Image
                src={coverImage}
                alt={`${provider.user.fullName} çalışma görseli`}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.22),transparent_28%),linear-gradient(135deg,#083228,#06291f)]" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-[#04130d]/85 via-[#04130d]/20 to-transparent" />
            <div className="absolute inset-x-5 bottom-5 rounded-[24px] border border-white/15 bg-white/12 p-4 text-white shadow-2xl backdrop-blur-md">
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
                Öne Çıkan Hizmet
              </p>
              <h2 className="mt-2 text-2xl font-black">{primaryCategory}</h2>
              <p className="mt-2 text-sm leading-6 text-white/78">
                Hizmet detaylarını inceleyin, uygun görürseniz birkaç dakika
                içinde teklif isteyin.
              </p>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <main className="min-w-0 space-y-5">
            <ProviderProfileTabs
              tabs={[
                {
                  id: "about",
                  label: "Hakkında",
                  content: (
                    <div className="space-y-5">
                      <ProfileCard
                        id="hakkinda"
                        title="Hakkında"
                        actionLabel={isOwnProviderProfile ? "Düzenle" : undefined}
                        actionHref={isOwnProviderProfile ? ROUTES.provider.profile : undefined}
                      >
                        <p className="text-sm leading-7 text-[#53635f]">
                          {provider.bio ??
                            `${provider.user.fullName}, ${primaryCategory.toLocaleLowerCase("tr-TR")} alanında profesyonel hizmet verir. Güvenli hizmet, hızlı iletişim ve müşteri memnuniyeti önceliğidir.`}
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <InfoMetric icon={Zap} label="Uzmanlık Alanı" value={primaryCategory} />
                          <InfoMetric icon={MapPin} label="Hizmet Bölgesi" value={formatLocation(provider.baseCity, provider.baseDistrict)} />
                          <InfoMetric icon={Timer} label="Ortalama Yanıt" value={responseLabel} />
                          <InfoMetric icon={Eye} label="Profil Görüntülenme" value={profileViews.toLocaleString("tr-TR")} />
                        </div>
                      </ProfileCard>

                      <ProfileCard
                        title="Hizmet Bölgeleri"
                        actionLabel={isOwnProviderProfile ? "Düzenle" : "Tüm Bölgeler"}
                        actionHref={isOwnProviderProfile ? ROUTES.provider.areas : undefined}
                      >
                        <ServiceAreas
                          baseCity={provider.baseCity}
                          baseDistrict={provider.baseDistrict}
                          baseLatitude={provider.baseLatitude}
                          baseLongitude={provider.baseLongitude}
                          serviceRadiusKm={provider.serviceRadiusKm}
                          areas={provider.serviceAreas}
                        />
                      </ProfileCard>
                    </div>
                  ),
                },
                {
                  id: "services",
                  label: "Hizmetler",
                  content: (
                    <ProfileCard
                      id="hizmetler"
                      title="Hizmetler ve İlanlar"
                      actionLabel={isOwnProviderProfile ? "İlanları Düzenle" : "Tüm İlanlar"}
                      actionHref={isOwnProviderProfile ? ROUTES.provider.listings : undefined}
                    >
                      <ServicesPanel
                        serviceGroups={providerServiceGroups}
                        listings={provider.listings}
                      />
                    </ProfileCard>
                  ),
                },
                {
                  id: "reviews",
                  label: `Yorumlar (${reviewCount})`,
                  content: (
                    <ProfileCard title="Yorumlar" actionLabel="Tüm Yorumlar">
                      <ReviewsPanel
                        ratingAvg={ratingAvg}
                        reviewCount={reviewCount}
                        reviews={provider.reviews}
                      />
                    </ProfileCard>
                  ),
                },
                {
                  id: "completed",
                  label: "Tamamlanan İşler",
                  content: (
                    <ProfileCard title="Tamamlanan İşler">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard icon={BriefcaseBusiness} value={String(completedOrderCount)} label="Tamamlanan iş" />
                        <StatCard icon={Star} value={String(ratingAvg ?? "-")} label="Ortalama puan" />
                        <StatCard icon={MessageSquare} value={String(reviewCount)} label="Müşteri yorumu" />
                      </div>
                    </ProfileCard>
                  ),
                },
                {
                  id: "faq",
                  label: "S.S.S",
                  content: (
                    <ProfileCard title="Sık Sorulan Sorular">
                      <FaqPanel faqs={provider.faqs} />
                    </ProfileCard>
                  ),
                },
              ]}
            />

            <ProfileCard
              title="Sertifikalar"
              actionLabel={isOwnProviderProfile ? "Profilde Yönet" : undefined}
              actionHref={isOwnProviderProfile ? ROUTES.provider.profile : undefined}
            >
              <CertificatesPanel documents={provider.documents} />
            </ProfileCard>

            <OfferRequestPanel
              href={createRequestHref}
              providerName={provider.user.fullName}
            />
          </main>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <ProfileCard title="Hızlı Bilgiler" compact>
              <div className="space-y-3 text-sm">
                <QuickInfo icon={Star} label="Puan" value={String(ratingAvg ?? "-")} />
                <QuickInfo icon={MessageSquare} label="Yorum Sayısı" value={String(reviewCount)} />
                <QuickInfo icon={BriefcaseBusiness} label="Tamamlanan İş" value={String(completedOrderCount)} />
                <QuickInfo icon={Timer} label="Yanıt Oranı" value={responseRateLabel} />
                <QuickInfo icon={Clock} label="Son Aktif" value={lastActiveLabel} />
              </div>
              <ProviderShareButton title={provider.user.fullName} />
            </ProfileCard>

            <ProfileCard title="Rozetler" compact>
              {dynamicBadges.length > 0 ? (
                dynamicBadges.map((badge) => (
                  <BadgeRow
                    key={badge.title}
                    icon={badge.icon}
                    title={badge.title}
                    description={badge.description}
                  />
                ))
              ) : (
                <p className="text-xs leading-5 text-[#53635f]">
                  Rozet kazanmak için tamamlanan iş, yorum veya doğrulama bilgisi
                  gerekiyor.
                </p>
              )}
            </ProfileCard>

          </aside>
        </div>

        <div className="mt-6 grid gap-4 rounded-[24px] border border-black/5 bg-white p-4 text-xs font-semibold text-[#53635f] shadow-[0_14px_38px_rgba(15,23,42,0.05)] sm:grid-cols-3">
          <TrustItem icon={ShieldCheck} title="Profusta Güvencesi" text="Tüm ödemeler güvence altındadır." />
          <TrustItem icon={HeartHandshake} title="7/24 Destek" text="Her zaman yanınızdayız." />
          <TrustItem icon={Award} title="Memnuniyet Garantisi" text="Memnun kalmazsanız çözüm üretiriz." />
        </div>
      </div>
    </div>
  );
}

function formatCategory(slug?: string | null) {
  if (!slug) return null;
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR") + part.slice(1))
    .join(" ");
}

function formatLocation(city?: string | null, district?: string | null) {
  if (!city) return "Konum belirtilmedi";
  return district ? `${city}, ${district}` : city;
}

async function trackProviderProfileView({
  providerId,
  viewerId,
  skip,
}: {
  providerId: string;
  viewerId?: string;
  skip: boolean;
}) {
  if (skip) return;

  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headerList.get("x-real-ip")?.trim();
  const ip = forwardedFor || realIp || "unknown";
  const ipHash = createHash("sha256").update(ip).digest("hex");
  const userAgent = headerList.get("user-agent")?.slice(0, 255) ?? null;
  const recentSince = new Date(Date.now() - 1000 * 60 * 60 * 6);

  const recentView = await db.providerProfileView.findFirst({
    where: {
      providerId,
      createdAt: { gte: recentSince },
      OR: viewerId ? [{ viewerId }, { ipHash }] : [{ ipHash }],
    },
    select: { id: true },
  });

  if (recentView) return;

  await db.providerProfileView.create({
    data: {
      providerId,
      viewerId,
      ipHash,
      userAgent,
    },
  });
}

function getProviderResponseStats(
  conversations: {
    customerId: string;
    messages: { senderId: string; createdAt: Date }[];
  }[],
  providerUserId: string,
) {
  let customerConversationCount = 0;
  let respondedCount = 0;
  const responseMinutes: number[] = [];

  for (const conversation of conversations) {
    const firstCustomerMessage = conversation.messages.find(
      (message) => message.senderId === conversation.customerId,
    );

    if (!firstCustomerMessage) continue;
    customerConversationCount += 1;

    const firstProviderReply = conversation.messages.find(
      (message) =>
        message.senderId === providerUserId &&
        message.createdAt > firstCustomerMessage.createdAt,
    );

    if (!firstProviderReply) continue;
    respondedCount += 1;
    responseMinutes.push(
      Math.max(
        1,
        Math.round(
          (firstProviderReply.createdAt.getTime() -
            firstCustomerMessage.createdAt.getTime()) /
            60000,
        ),
      ),
    );
  }

  const averageMinutes =
    responseMinutes.length > 0
      ? Math.round(
          responseMinutes.reduce((total, minutes) => total + minutes, 0) /
            responseMinutes.length,
        )
      : null;
  const responseRate =
    customerConversationCount > 0
      ? Math.round((respondedCount / customerConversationCount) * 100)
      : 0;

  return {
    averageMinutes,
    responseRate,
    customerConversationCount,
  };
}

function formatDurationMinutes(minutes: number) {
  if (minutes < 60) return `${minutes} dakika`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat`;

  const days = Math.round(hours / 24);
  return `${days} gün`;
}

function formatRelativeTime(date: Date) {
  const diffMinutes = Math.max(
    1,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes} dk önce`;

  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} gün önce`;

  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getProviderBadges({
  isPro,
  ratingAvg,
  reviewCount,
  completedOrderCount,
  cancelCount,
  documentCount,
  listingCount,
}: {
  isPro: boolean;
  ratingAvg: number | null;
  reviewCount: number;
  completedOrderCount: number;
  cancelCount: number;
  documentCount: number;
  listingCount: number;
}) {
  const badges: {
    icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
  }[] = [];

  if (isPro) {
    badges.push({
      icon: Trophy,
      title: "PRO USTA",
      description: "Admin tarafından öne çıkarılan usta",
    });
  }

  if ((ratingAvg ?? 0) >= 4.7 && reviewCount >= 5) {
    badges.push({
      icon: ShieldCheck,
      title: "GÜVENİLİR USTA",
      description: "Yüksek puan ve güçlü müşteri yorumları",
    });
  }

  if (completedOrderCount >= 10) {
    badges.push({
      icon: CheckCircle2,
      title: "TECRÜBELİ USTA",
      description: "Platformda çok sayıda işi tamamladı",
    });
  }

  if (cancelCount === 0 && completedOrderCount > 0) {
    badges.push({
      icon: Clock,
      title: "ZAMANINDA",
      description: "İş takibinde yüksek güven performansı",
    });
  }

  if (documentCount > 0) {
    badges.push({
      icon: FileBadge,
      title: "BELGELİ USTA",
      description: "Admin paneline doğrulama belgesi yüklenmiş",
    });
  }

  if (listingCount >= 3) {
    badges.push({
      icon: Zap,
      title: "AKTİF HİZMET",
      description: "Birden fazla aktif hizmet ilanı var",
    });
  }

  return badges;
}

function ServiceAreas({
  baseCity,
  baseDistrict,
  baseLatitude,
  baseLongitude,
  serviceRadiusKm,
  areas,
}: {
  baseCity: string | null;
  baseDistrict: string | null;
  baseLatitude: number | null;
  baseLongitude: number | null;
  serviceRadiusKm: number | null;
  areas: {
    id: string;
    city: string;
    district: string | null;
    radiusKm: number;
  }[];
}) {
  const visibleAreas =
    areas.length > 0
      ? areas
      : [
          {
            id: "base",
            city: baseCity ?? "Türkiye",
            district: baseDistrict,
            radiusKm: serviceRadiusKm ?? 20,
          },
        ];

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {visibleAreas.map((area) => (
          <span
            key={area.id}
            className="rounded-full bg-[#f6f8fb] px-3 py-1.5 text-xs font-bold text-[#53635f]"
          >
            {area.city}
            {area.district ? ` / ${area.district}` : ""}
          </span>
        ))}
      </div>

      {baseLatitude != null && baseLongitude != null ? (
        <div className="overflow-hidden rounded-2xl border border-black/5">
          <ReadonlyLocationMap
            latitude={baseLatitude}
            longitude={baseLongitude}
            radiusKm={serviceRadiusKm ?? undefined}
          />
        </div>
      ) : (
        <EmptyBlock
          icon={MapPin}
          title="Konum bilgisi yakında eklenecek"
          description="Ustanın hizmet verdiği bölgeler yukarıdaki etiketlerde görünür."
        />
      )}
    </>
  );
}

function ServicesPanel({
  serviceGroups,
  listings,
}: {
  serviceGroups: {
    id: string;
    name: string;
    slug: string;
    coverImageUrl: string | null;
    icon: string | null;
    services: {
      id: string;
      name: string;
      description: string | null;
    }[];
  }[];
  listings: {
    id: string;
    title: string;
    city: string;
    district: string | null;
    price: number;
    images: { id: string; url: string }[];
  }[];
}) {
  return (
    <div className="space-y-6">
      {serviceGroups.length > 0 ? (
        <div className="space-y-4">
          {serviceGroups.map((group) => {
            const GroupIcon = getCategoryIcon(group.icon);
            const groupCover = group.coverImageUrl;

            return (
            <section
              key={group.id}
              className="rounded-[22px] border border-[#087a61]/10 bg-[#FBFDF5] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CategoryCoverThumb
                    coverImageUrl={groupCover}
                    Icon={GroupIcon}
                    name={group.name}
                    size="sm"
                  />
                  <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#087a61]">
                    Hizmet Kategorisi
                  </p>
                  <h3 className="mt-1 text-lg font-black text-[#083228]">
                    {group.name}
                  </h3>
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black text-[#087a61]">
                  {group.services.length || 1} hizmet
                </span>
              </div>

              {group.services.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.services.map((service) => (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <CategoryCoverThumb
                          coverImageUrl={groupCover}
                          Icon={GroupIcon}
                          name={service.name}
                          size="sm"
                          rounded="2xl"
                        />
                        <div>
                          <p className="text-sm font-black text-[#083228]">
                            {service.name}
                          </p>
                          {service.description ? (
                            <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#53635f]">
                              {service.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-white p-3 text-xs font-semibold text-[#53635f]">
                  Bu kategori altında hizmet veriyor.
                </p>
              )}
            </section>
            );
          })}
        </div>
      ) : (
        <EmptyBlock
          icon={BriefcaseBusiness}
          title="Hizmet bilgisi bulunmuyor"
          description="Usta hizmet kategorisi eklediğinde burada görünür."
        />
      )}

      <div>
        <h3 className="mb-3 text-base font-black text-[#083228]">
          Aktif İlanlar
        </h3>
        {listings.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {listings.slice(0, 8).map((listing) => (
              <Link
                key={listing.id}
                href={`${ROUTES.listings}/${listing.id}`}
                className="group overflow-hidden rounded-[22px] border border-black/5 bg-white transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]"
              >
                <div className="relative h-28 bg-[#eef8f5]">
                  {listing.images[0] ? (
                    <Image
                      src={listing.images[0].url}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-[#087a61]">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-2 text-sm font-black text-[#083228] transition group-hover:text-[#087a61]">
                    {listing.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#53635f]">
                    {listing.city}
                    {listing.district ? `, ${listing.district}` : ""}
                  </p>
                  <p className="mt-2 text-sm font-black text-[#087a61]">
                    {listing.price.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyBlock
            icon={BriefcaseBusiness}
            title="Aktif ilan bulunmuyor"
            description="Bu usta henüz vitrinde gösterilecek hizmet ilanı eklememiş."
          />
        )}
      </div>
    </div>
  );
}

function ReviewsPanel({
  ratingAvg,
  reviewCount,
  reviews,
}: {
  ratingAvg: number | null;
  reviewCount: number;
  reviews: {
    id: string;
    rating: number;
    comment: string;
    createdAt: Date;
    customer: { fullName: string; avatarUrl: string | null };
  }[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="rounded-2xl bg-[#FBFDF5] p-5 text-center">
        <p className="text-4xl font-black text-[#083228]">{ratingAvg ?? "-"}</p>
        <div className="mt-2 flex justify-center gap-1">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className="h-4 w-4 fill-amber-400 text-amber-400"
            />
          ))}
        </div>
        <p className="mt-2 text-xs font-semibold text-[#53635f]">
          {reviewCount} yorum
        </p>
      </div>

      {reviews.length > 0 ? (
        <div className="space-y-3">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-black/5 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <Avatar
                  name={review.customer.fullName}
                  src={review.customer.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-[#083228]">
                      {review.customer.fullName}
                    </p>
                    <span className="text-xs text-[#7b8b87]">
                      {review.createdAt.toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <div className="mt-1 flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, index) => (
                      <Star
                        key={index}
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#53635f]">
                    {review.comment}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyBlock
          icon={Star}
          title="Henüz yorum yok"
          description="İlk değerlendirme tamamlanan hizmetten sonra burada görünür."
        />
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-[#FBFDF5] p-5 shadow-sm">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#087a61] shadow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-black text-[#083228]">{value}</p>
      <p className="mt-1 text-xs font-bold text-[#53635f]">{label}</p>
    </div>
  );
}

function FaqPanel({
  faqs,
}: {
  faqs: { id: string; question: string; answer: string }[];
}) {
  if (faqs.length === 0) {
    return (
      <EmptyBlock
        icon={MessageSquare}
        title="Henüz S.S.S eklenmedi"
        description="Usta profil panelinden sık sorulan sorularını eklediğinde burada görünür."
      />
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq) => (
        <FaqItem key={faq.id} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="rounded-2xl border border-black/5 bg-[#FBFDF5] p-4">
      <summary className="cursor-pointer text-sm font-black text-[#083228]">
        {question}
      </summary>
      <p className="mt-3 text-sm leading-6 text-[#53635f]">{answer}</p>
    </details>
  );
}

function CertificatesPanel({
  documents,
}: {
  documents: {
    id: string;
    type: string;
    fileName: string | null;
    createdAt: Date;
  }[];
}) {
  if (documents.length === 0) {
    return (
      <EmptyBlock
        icon={FileBadge}
        title="Sertifika bilgisi henüz eklenmedi"
        description="Usta sertifika veya belge eklediğinde burada geniş kart olarak görünür."
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {documents.slice(0, 6).map((document) => (
        <div
          key={document.id}
          className="flex items-center gap-4 rounded-2xl border border-black/5 bg-[#FBFDF5] p-4"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#087a61] shadow-sm">
            <FileBadge className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[#083228]">
              {document.fileName ?? document.type}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#7b8b87]">
              {document.createdAt.getFullYear()} yılında eklendi
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function OfferRequestPanel({
  href,
  providerName,
}: {
  href: string;
  providerName: string;
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] bg-linear-to-br from-[#083228] to-[#06291f] p-5 text-white shadow-[0_22px_50px_rgba(8,50,40,.20)] sm:p-6">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-[#0b8067]/30 blur-2xl" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/80">
            Özel Teklif
          </span>
          <h2 className="mt-3 text-2xl font-black">
            {providerName} ustadan teklif alın
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/78">
            İşinizi kısaca anlatın; ücretsiz teklif, hızlı yanıt ve güvenli ödeme
            adımlarıyla süreci başlatın.
          </p>
        </div>

        <Link
          href={href}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-[#06291f] shadow-[0_14px_26px_rgba(0,0,0,.18)] transition hover:-translate-y-0.5"
        >
          <Send className="h-4 w-4" />
          Teklif İste
        </Link>
      </div>
    </section>
  );
}

function ProfileCard({
  id,
  title,
  actionLabel,
  actionHref,
  compact = false,
  children,
}: {
  id?: string;
  title: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`rounded-[24px] border border-black/5 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.05)] ${
        compact ? "p-4" : "p-5 sm:p-6"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-black text-[#083228]">{title}</h2>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#087a61] transition hover:bg-[#dcefe6]"
          >
            {actionLabel}
          </Link>
        ) : actionLabel ? (
          <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#087a61]">
            {actionLabel}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function HeroMetric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-[22px] border border-black/5 bg-[#f8fafc] p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#087a61] shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7b8b87]">
            {label}
          </p>
          <p className="mt-1 truncate text-base font-black text-[#083228]">
            {value}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs font-semibold text-[#53635f]">{helper}</p>
    </div>
  );
}

function InfoMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f6f8fb] text-[#087a61]">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] font-semibold text-[#7b8b87]">{label}</p>
        <p className="mt-0.5 text-xs font-black text-[#083228]">{value}</p>
      </div>
    </div>
  );
}

function QuickInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#f8fafc] px-3 py-2.5">
      <span className="inline-flex items-center gap-2 text-[#53635f]">
        <Icon className="h-4 w-4 text-[#7b8b87]" />
        {label}
      </span>
      <span className="font-black text-[#083228]">{value}</span>
    </div>
  );
}

function BadgeRow({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-3 flex gap-3 rounded-2xl bg-[#f8fafc] p-3 last:mb-0">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#087a61] shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-xs font-black text-[#083228]">{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-[#53635f]">
          {description}
        </p>
      </div>
    </div>
  );
}

function EmptyBlock({
  icon: Icon,
  title,
  description,
  small = false,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#087a61]/20 bg-[#FBFDF5] text-center ${
        small ? "p-4" : "p-6"
      }`}
    >
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#087a61]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-sm font-black text-[#083228]">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-[#53635f]">{description}</p>
    </div>
  );
}

function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src: string | null;
  size?: "sm" | "md";
}) {
  const className =
    size === "sm"
      ? "h-10 w-10 rounded-full text-sm"
      : "h-12 w-12 rounded-full text-base";

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden bg-[#eef8f5] font-black text-[#087a61] ${className}`}
    >
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" />
      ) : (
        name.charAt(0)
      )}
    </div>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-black text-[#083228]">{title}</p>
        <p className="mt-0.5 text-[#7b8b87]">{text}</p>
      </div>
    </div>
  );
}
