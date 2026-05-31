"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import type { HeaderUser } from "@/lib/auth/header-user";

/** Site header/footer gösterilmeyen panel rotaları */
function isPanelRoute(pathname: string) {
  return (
    pathname === "/musteri" ||
    pathname.startsWith("/musteri/") ||
    pathname === "/usta" ||
    pathname.startsWith("/usta/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export function SiteChrome({
  headerUser,
  children,
}: {
  headerUser: HeaderUser | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const panel = isPanelRoute(pathname);

  if (panel) {
    return <main className="flex min-h-0 flex-1 flex-col">{children}</main>;
  }

  return (
    <>
      <SiteHeader user={headerUser} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}
