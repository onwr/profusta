import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ReadonlyLocationMap } from "@/components/geo/readonly-location-map";
import { PurchaseListingButton } from "@/components/listings/purchase-listing-button";
import { StartConversationButton } from "@/components/messages/start-conversation-button";
import { ListingStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  const listing = await db.listing.findFirst({
    where: { id, status: ListingStatus.ACTIVE },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      provider: {
        include: {
          user: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
  });

  if (!listing) notFound();

  const cover = listing.images[0]?.url;
  const galleryImages = listing.images.slice(1, 5);
  const providerHref = `${ROUTES.providers}/${
    listing.provider.slug ?? listing.providerId
  }`;

  return (
    <main className="min-h-screen bg-[#f6f7f2]">
      <section className="relative overflow-hidden bg-[#083228]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.45),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative mx-auto max-w-screen-2xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <Link
            href={ROUTES.listings}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm ilanlar
          </Link>

          <div className="mt-8 max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80 ring-1 ring-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              {listing.category.name}
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              {listing.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-white/72">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <MapPin className="h-4 w-4" />
                {listing.city}
                {listing.district ? ` / ${listing.district}` : ""}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <UserRound className="h-4 w-4" />
                {listing.provider.user.fullName}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
                <BadgeCheck className="h-4 w-4" />
                Aktif ilan
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-8">
            <section className="overflow-hidden rounded-4xl border border-black/5 bg-white p-3 shadow-[0_18px_55px_rgba(8,50,40,0.07)]">
              {cover ? (
                <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-[#eef3f1]">
                  <Image
                    src={cover}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 65vw"
                    priority
                  />

                  <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-black/55 to-transparent" />

                  <div className="absolute bottom-5 left-5 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-[#083228] backdrop-blur">
                    {listing.category.name}
                  </div>
                </div>
              ) : (
                <div className="flex aspect-4/3 items-center justify-center rounded-3xl bg-[#eef3f1] text-sm font-semibold text-[#66736f]">
                  Görsel eklenmemiş
                </div>
              )}

              {galleryImages.length > 0 ? (
                <div className="mt-3 grid grid-cols-4 gap-3">
                  {galleryImages.map((img, index) => (
                    <div
                      key={img.id}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-[#eef3f1]"
                    >
                      <Image
                        src={img.url}
                        alt={`${listing.title} görsel ${index + 2}`}
                        fill
                        className="object-cover transition hover:scale-105"
                        sizes="180px"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-4xl border border-black/5 bg-white p-6 shadow-[0_18px_55px_rgba(8,50,40,0.06)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                  <MessageCircle className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#087a61]">
                    İlan açıklaması
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#083228]">
                    Hizmet detayları
                  </h2>
                </div>
              </div>

              {listing.description ? (
                <p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-[#53635f] sm:text-base">
                  {listing.description}
                </p>
              ) : (
                <p className="mt-6 text-sm leading-7 text-[#53635f] sm:text-base">
                  Bu ilan için detaylı açıklama eklenmemiş. Ustayla iletişime
                  geçerek hizmet kapsamı, süre ve fiyat detaylarını
                  netleştirebilirsiniz.
                </p>
              )}
            </section>

            <section className="rounded-4xl border border-black/5 bg-white p-6 shadow-[0_18px_55px_rgba(8,50,40,0.06)] sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#087a61]">
                    Konum
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-[#083228]">
                    Hizmet bölgesi
                  </h2>
                  <p className="mt-2 text-sm text-[#66736f]">
                    {listing.city}
                    {listing.district ? ` / ${listing.district}` : ""}
                    {listing.serviceRadiusKm
                      ? ` · ${listing.serviceRadiusKm} km hizmet alanı`
                      : ""}
                  </p>
                </div>

                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                  <MapPin className="h-6 w-6" />
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-black/5">
                <ReadonlyLocationMap
                  latitude={listing.latitude}
                  longitude={listing.longitude}
                  radiusKm={listing.serviceRadiusKm}
                />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-4xl border border-black/5 bg-white shadow-[0_24px_70px_rgba(8,50,40,0.12)]">
              <div className="bg-[#083228] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
                  Hizmet bedeli
                </p>

                <p className="mt-2 text-4xl font-black tracking-tight">
                  {listing.price.toLocaleString("tr-TR")} ₺
                </p>

                <p className="mt-2 text-sm text-white/65">
                  İlan sahibi tarafından belirlenen başlangıç fiyatıdır.
                </p>
              </div>

              <div className="p-6">
                <div className="rounded-2xl border border-[#087a61]/10 bg-[#f3fbf8] p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#087a61]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="font-black text-[#083228]">
                        Güvenli iletişim
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-[#66736f]">
                        Satın almadan önce usta ile mesajlaşarak hizmet
                        kapsamını netleştirebilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <StartConversationButton
                    providerId={listing.providerId}
                    listingId={listing.id}
                  />

                  <PurchaseListingButton
                    listingId={listing.id}
                    className="h-12 w-full rounded-2xl bg-[#087a61] text-sm font-black text-white hover:bg-[#06644f]"
                  />
                </div>

                <div className="mt-6 border-t border-black/5 pt-6">
                  <h2 className="font-black text-[#083228]">Usta bilgisi</h2>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                      <UserRound className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="line-clamp-1 font-black text-[#083228]">
                        {listing.provider.user.fullName}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-[#66736f]">
                        Hizmet sağlayıcı
                      </p>
                    </div>
                  </div>

                  <Link
                    href={providerHref}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-black/10 bg-white text-sm font-black text-[#083228] transition hover:border-[#087a61]/30 hover:bg-[#eef8f5] hover:text-[#087a61]"
                  >
                    Usta profilini gör
                  </Link>
                </div>

                <div className="mt-6 space-y-3 border-t border-black/5 pt-6">
                  <InfoRow
                    icon={CheckCircle2}
                    title="Aktif ilan"
                    text="Bu ilan şu anda yayında."
                  />
                  <InfoRow
                    icon={Clock}
                    title="Hızlı aksiyon"
                    text="Mesaj atarak detayları netleştirebilirsiniz."
                  />
                  <InfoRow
                    icon={MapPin}
                    title="Hizmet bölgesi"
                    text={`${listing.city}${
                      listing.district ? ` / ${listing.district}` : ""
                    }`}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-10 overflow-hidden rounded-4xl bg-[#083228] shadow-[0_24px_70px_rgba(8,50,40,0.14)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.5),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_25%)] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Bu hizmet size uygun görünüyorsa ustayla görüşün
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Hizmet kapsamını, uygun zamanı ve detayları netleştirdikten
                  sonra satın alma adımına geçebilirsiniz.
                </p>
              </div>

              <Link
                href={providerHref}
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-black text-[#083228] transition hover:bg-[#eef8f5]"
              >
                Usta Profilini İncele
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
        <Icon className="h-4.5 w-4.5" />
      </div>

      <div>
        <p className="text-sm font-black text-[#083228]">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[#66736f]">{text}</p>
      </div>
    </div>
  );
}