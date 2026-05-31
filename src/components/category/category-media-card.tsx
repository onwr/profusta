import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { cn } from "@/lib/utils";

type CategoryMediaCardProps = {
  href: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  Icon: LucideIcon;
  badge?: string | null;
  priceLabel?: string | null;
  className?: string;
};

/** Kategori kapağı veya ikon ile hizmet/kategori kartı (anasayfa, listeler). */
export function CategoryMediaCard({
  href,
  title,
  description,
  coverImageUrl,
  Icon,
  badge,
  priceLabel,
  className,
}: CategoryMediaCardProps) {
  const cover = coverImageUrl ?? null;

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-[0_18px_55px_rgba(8,50,40,0.07)] transition duration-300 hover:-translate-y-1 hover:border-[#087a61]/25 hover:shadow-[0_24px_70px_rgba(8,50,40,0.12)]",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#eef3f1]">
        {cover ? (
          <>
            <Image
              src={cover}
              alt={title}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 25vw"
              unoptimized={cover.startsWith("http")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-3 top-3 z-10">
              <CategoryCoverThumb
                coverImageUrl={null}
                Icon={Icon}
                name={title}
                size="sm"
                rounded="2xl"
                className="ring-2 ring-white/90 shadow-sm"
              />
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-linear-to-br from-[#f2f7f5] to-[#e7f2ef]">
            <CategoryCoverThumb
              coverImageUrl={null}
              Icon={Icon}
              name={title}
              size="md"
              rounded="2xl"
            />
          </div>
        )}



        {priceLabel ? (
          <span className="absolute bottom-3 right-3 z-10 rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#087a61] shadow-sm">
            {priceLabel}
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-base font-black leading-snug text-[#083228] transition group-hover:text-[#087a61]">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#53635f]">
            {description}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
