import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

type ListingCardProps = {
  id: string;
  title: string;
  price: number;
  city: string;
  district?: string | null;
  categoryName: string;
  providerName: string;
  imageUrl?: string;
  distanceKm?: number;
};

export function ListingCard({
  id,
  title,
  price,
  city,
  district,
  categoryName,
  providerName,
  imageUrl,
  distanceKm,
}: ListingCardProps) {
  return (
    <Link
      href={`${ROUTES.listings}/${id}`}
      className="group block overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-[0_18px_55px_rgba(8,50,40,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#087a61]/25 hover:shadow-[0_24px_70px_rgba(8,50,40,0.12)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f1]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-sm font-semibold text-[#8a9692]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white">
              📷
            </div>
            Görsel eklenmemiş
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-[#087a61] shadow-sm backdrop-blur">
          {categoryName}
        </div>

        {distanceKm != null ? (
          <div className="absolute bottom-4 left-4 rounded-full bg-[#083228]/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            Sana {distanceKm} km
          </div>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-black leading-snug text-[#083228] transition group-hover:text-[#087a61]">
              {title}
            </h3>

            <p className="mt-2 line-clamp-1 text-sm font-semibold text-[#53635f]">
              {providerName}
            </p>
          </div>

          <div className="shrink-0 rounded-2xl bg-[#eef8f5] px-3 py-2 text-right">
            <p className="text-[11px] font-bold text-[#66736f]">Başlayan</p>
            <p className="text-lg font-black text-[#087a61]">
              {price.toLocaleString("tr-TR")} ₺
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-black/5 pt-4">
          <p className="line-clamp-1 text-sm font-semibold text-[#66736f]">
            {city}
            {district ? ` / ${district}` : ""}
          </p>

          <span className="rounded-full bg-[#083228] px-3 py-2 text-xs font-black text-white transition group-hover:bg-[#087a61]">
            İncele
          </span>
        </div>
      </div>
    </Link>
  );
}