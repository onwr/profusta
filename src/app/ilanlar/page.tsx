import { Suspense } from "react";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingFilters } from "@/components/listings/listing-filters";
import { ListingsLocationBanner } from "@/components/listings/listings-location-banner";
import { getActiveCategories } from "@/lib/categories";
import { getActiveListings } from "@/lib/listings/query";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    categoryId?: string;
    city?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    lat?: string;
    lng?: string;
    sort?: string;
  }>;
};

export default async function ListingsPage({ searchParams }: Props) {
  const params = await searchParams;

  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const lat = params.lat ? Number(params.lat) : undefined;
  const lng = params.lng ? Number(params.lng) : undefined;

  const hasCoords =
    params.lat != null &&
    params.lng != null &&
    Number.isFinite(Number(params.lat)) &&
    Number.isFinite(Number(params.lng));

  const sort =
    params.sort === "price_asc" ||
    params.sort === "price_desc" ||
    params.sort === "distance"
      ? params.sort
      : hasCoords
        ? "distance"
        : undefined;

  const [categories, listings] = await Promise.all([
    getActiveCategories(),
    getActiveListings({
      categoryId: params.categoryId,
      city: params.city,
      district: params.district,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      sort,
    }),
  ]);

  const activeFilterCount = [
    params.categoryId,
    params.city,
    params.district,
    params.minPrice,
    params.maxPrice,
    params.sort,
  ].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-[#f6f7f2]">
      <section className="relative overflow-hidden border-b border-black/5 bg-[#083228]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.45),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-white/80 backdrop-blur">
              Profesyonel hizmet pazarı
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Hizmet ilanlarını keşfedin
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Onaylı ustaların yayınladığı hizmetleri inceleyin, konumunuza en
              yakın ilanları bulun ve ihtiyacınıza en uygun teklifi seçin.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">{listings.length}</p>
              <p className="mt-1 text-sm text-white/65">Aktif ilan</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">
                {categories.length}
              </p>
              <p className="mt-1 text-sm text-white/65">Hizmet kategorisi</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black text-white">
                {hasCoords ? "Aktif" : "Kapalı"}
              </p>
              <p className="mt-1 text-sm text-white/65">Konuma göre sıralama</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
        <ListingsLocationBanner hasLocation={!!hasCoords} />

        <div className="grid gap-8 lg:grid-cols-[390px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-6">
            <Suspense
              fallback={
                <div className="h-[460px] animate-pulse rounded-[2rem] bg-white shadow-sm" />
              }
            >
              <ListingFilters
                categories={categories.map((c) => ({
                  id: c.id,
                  name: c.name,
                }))}
              />
            </Suspense>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#083228]">
                  {listings.length} ilan listeleniyor
                </p>
                <p className="mt-1 text-sm text-[#66736f]">
                  {activeFilterCount > 0
                    ? `${activeFilterCount} filtre aktif`
                    : "Tüm aktif hizmet ilanları gösteriliyor"}
                </p>
              </div>

              <div className="rounded-full border border-black/5 bg-white px-4 py-2 text-xs font-bold text-[#53635f] shadow-sm">
                {sort === "distance"
                  ? "Yakına göre sıralı"
                  : sort === "price_asc"
                    ? "Fiyat artan"
                    : sort === "price_desc"
                      ? "Fiyat azalan"
                      : "Varsayılan sıralama"}
              </div>
            </div>

            {listings.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-black/10 bg-white p-10 text-center shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef8f5] text-2xl">
                  🔎
                </div>
                <h2 className="mt-5 text-xl font-black text-[#083228]">
                  Uygun ilan bulunamadı
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66736f]">
                  Seçtiğiniz filtrelere uygun ilan bulunamadı. Fiyat aralığını
                  genişletmeyi veya konum filtresini değiştirmeyi deneyin.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((l) => (
                  <ListingCard
                    key={l.id}
                    id={l.id}
                    title={l.title}
                    price={l.price}
                    city={l.city}
                    district={l.district}
                    categoryName={l.category.name}
                    providerName={l.provider.user.fullName}
                    imageUrl={l.images[0]?.url}
                    distanceKm={l.distanceKm}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}