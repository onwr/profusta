import Image from "next/image";
import { APP_NAME } from "@/lib/constants";
import { getLogoSrc } from "@/lib/logo";
import { cn } from "@/lib/utils";

type SiteLogoProps = {
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
};

/** `unoptimized`: Next `/_next/image` önbelleğine girmez; doğrudan public/logo.png */
export function SiteLogo({
  width,
  height,
  className,
  priority = false,
}: SiteLogoProps) {
  return (
    <Image
      src={getLogoSrc()}
      alt={APP_NAME}
      width={width}
      height={height}
      priority={priority}
      unoptimized
      className={cn("w-auto object-contain object-left", className)}
    />
  );
}
