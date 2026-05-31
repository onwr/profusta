"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Sparkles,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

type Fav = {
  id: string;
  providerId: string;
  providerSlug: string | null;
  fullName: string;
  baseCity: string | null;
  ratingAvg: number | null;
  reviewCount: number;
};

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<Fav[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => {
        setFavorites(d.favorites ?? []);
        setLoading(false);
      });
  }, []);

  async function remove(providerId: string) {
    await fetch(`/api/favorites/${providerId}`, { method: "DELETE" });
    setFavorites((f) => f.filter((x) => x.providerId !== providerId));
  }

  function providerHref(favorite: Fav) {
    return `${ROUTES.providers}/${favorite.providerSlug ?? favorite.providerId}`;
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              Favori Ustalar
            </div>

            <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
              Favorilerim
            </h1>

            <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53635f]">
              Kaydettiğiniz ustalara hızlıca ulaşın, profillerini inceleyin ve
              mesaj gönderin.
            </p>
          </div>

          <Link
            href={ROUTES.providers}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-7 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
          >
            Usta Keşfet
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard icon={<Heart className="h-5 w-5" />} label="Favori Usta" value={loading ? "..." : favorites.length} />
          <StatCard icon={<Star className="h-5 w-5" />} label="Puanlı Usta" value={loading ? "..." : favorites.filter((f) => f.ratingAvg != null).length} />
          <StatCard icon={<MapPin className="h-5 w-5" />} label="Konumlu Usta" value={loading ? "..." : favorites.filter((f) => f.baseCity).length} />
        </div>
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#083228]">
            Kaydedilen Ustalar
          </h2>
          <p className="mt-1 text-sm text-[#53635f]">
            Favoriye aldığınız hizmet sağlayıcılar.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] bg-[#FBFDF5]">
            <div className="flex flex-col items-center gap-3 text-sm font-medium text-[#53635f]">
              <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
              Favoriler yükleniyor...
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-[#087a61]">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-black text-[#083228]">
              Henüz favori ustanız yok
            </h3>

            <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-[#53635f]">
              Beğendiğiniz ustaları favorilere ekleyerek daha sonra kolayca
              ulaşabilirsiniz.
            </p>

            <Link
              href={ROUTES.providers}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#087a61] px-6 text-sm font-black text-white"
            >
              Ustaları Keşfet
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <article
                key={favorite.id}
                className="group rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_16px_38px_rgba(8,50,40,0.07)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <Link
                    href={providerHref(favorite)}
                    className="flex min-w-0 gap-4"
                  >
                    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white text-xl font-black text-[#087a61] shadow-sm">
                      {favorite.fullName.charAt(0) || <UserRound className="h-7 w-7" />}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-black text-[#083228] transition group-hover:text-[#087a61]">
                        {favorite.fullName}
                      </h3>

                      {favorite.baseCity ? (
                        <p className="mt-1 flex items-center gap-1 text-sm font-medium text-[#53635f]">
                          <MapPin className="h-4 w-4 text-[#087a61]" />
                          {favorite.baseCity}
                        </p>
                      ) : null}

                      {favorite.ratingAvg != null ? (
                        <p className="mt-2 flex items-center gap-1 text-sm font-bold text-[#53635f]">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          {favorite.ratingAvg}/5
                          <span className="font-medium text-[#7b8b87]">
                            ({favorite.reviewCount} yorum)
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 text-sm font-medium text-[#53635f]">
                          Henüz değerlendirme yok
                        </p>
                      )}
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => remove(favorite.providerId)}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                    aria-label="Favoriden kaldır"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-[1fr_48px] gap-2">
                  <Link
                    href={providerHref(favorite)}
                    className="flex h-12 items-center justify-center rounded-2xl border border-[#087a61]/20 bg-white text-sm font-black text-[#087a61] transition hover:bg-[#eef8f5]"
                  >
                    Profili Gör
                  </Link>

                  <Link
                    href={`${providerHref(favorite)}#mesaj`}
                    className="grid h-12 place-items-center rounded-2xl bg-[#087a61] text-white transition hover:bg-[#06644f]"
                    aria-label="Mesaj gönder"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-black text-[#083228]">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-[#53635f]">{label}</p>
        </div>
      </div>
    </div>
  );
}