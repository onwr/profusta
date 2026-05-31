import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  coverImageUrl?: string | null;
  Icon: LucideIcon;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  rounded?: "full" | "2xl" | "3xl";
};

const sizeMap = {
  sm: { box: "h-14 w-14", icon: "h-6 w-6", iconWrap: "h-8 w-8" },
  md: { box: "h-20 w-20", icon: "h-7 w-7", iconWrap: "h-11 w-11" },
  lg: { box: "h-28 w-28", icon: "h-9 w-9", iconWrap: "h-14 w-14" },
};

export function CategoryCoverThumb({
  coverImageUrl,
  Icon,
  name,
  size = "md",
  className,
  rounded = "2xl",
}: Props) {
  const s = sizeMap[size];
  const roundClass =
    rounded === "full" ? "rounded-full" : rounded === "3xl" ? "rounded-3xl" : "rounded-2xl";

  if (coverImageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-[#eef8f5]",
          s.box,
          roundClass,
          className,
        )}
      >
        <Image
          src={coverImageUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="120px"
          unoptimized={coverImageUrl.startsWith("http")}
        />
        <div className="absolute inset-0 bg-[#083228]/35" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "grid place-items-center rounded-xl bg-white/95 text-[#087a61] shadow",
              s.iconWrap,
            )}
          >
            <Icon className={cn(s.icon, "stroke-[1.8]")} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center bg-[#eef8f5] text-[#087a61]",
        s.box,
        roundClass,
        className,
      )}
    >
      <Icon className={cn(s.icon, "stroke-[1.8]")} />
    </div>
  );
}
