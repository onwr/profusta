"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  ExternalLink,
  FileText,
  FolderTree,
  LayoutDashboard,
  Layers,
  LogIn,
  LogOut,
  Megaphone,
  Percent,
  Receipt,
  ShoppingBag,
  Star,
  AlertCircle,
  BarChart3,
  CreditCard,
  MapPin,
  Home,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  title: string;
  links: NavLink[];
};

const groups: NavGroup[] = [
  {
    title: "Genel",
    links: [
      { href: ROUTES.admin.dashboard, label: "Dashboard", icon: LayoutDashboard },
      { href: ROUTES.admin.reports, label: "Raporlar", icon: BarChart3 },
    ],
  },
  {
    title: "Operasyon",
    links: [
      { href: ROUTES.admin.applications, label: "Usta Başvuruları", icon: ClipboardList },
      { href: ROUTES.admin.providers, label: "Ustalar", icon: Wrench },
      { href: ROUTES.admin.users, label: "Kullanıcılar", icon: Users },
      { href: ROUTES.admin.requests, label: "Talepler", icon: ClipboardList },
      { href: ROUTES.admin.offers, label: "Teklifler", icon: FileText },
      { href: ROUTES.admin.listings, label: "İlanlar", icon: Megaphone },
      { href: ROUTES.admin.orders, label: "Siparişler", icon: ShoppingBag },
    ],
  },
  {
    title: "Finans",
    links: [
      { href: ROUTES.admin.payments, label: "Ödemeler", icon: Receipt },
      { href: ROUTES.admin.commission, label: "Komisyon", icon: Percent },
      { href: ROUTES.admin.iyzicoSettings, label: "İyzico Ayarları", icon: CreditCard },
      { href: ROUTES.admin.refundsDisputes, label: "İade ve İtirazlar", icon: AlertCircle },
    ],
  },
  {
    title: "İçerik ve Ayarlar",
    links: [
      { href: ROUTES.admin.homepage, label: "Anasayfa", icon: Home },
      { href: ROUTES.admin.categories, label: "Kategoriler", icon: FolderTree },
      { href: ROUTES.admin.services, label: "Alt Hizmetler", icon: Layers },
      { href: ROUTES.admin.reviews, label: "Yorumlar", icon: Star },
      { href: ROUTES.admin.serviceAreas, label: "Hizmet Bölgeleri", icon: MapPin },
      { href: ROUTES.admin.siteSettings, label: "Site Ayarları", icon: Settings },
      { href: ROUTES.admin.googleOAuth, label: "Google Giriş", icon: LogIn },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === ROUTES.admin.dashboard) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 flex-col self-start bg-linear-to-b from-[#06291f] via-[#07372b] to-[#041b15] text-white lg:flex">
      <div className="flex h-full max-h-dvh flex-col overflow-hidden p-4">
        <div className="shrink-0">
          <Link href={ROUTES.admin.dashboard} className="mb-3 block px-2">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={150}
              height={44}
              className="h-8 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          <div className="mb-3 flex items-center gap-2.5 rounded-[18px] bg-white/10 p-3 ring-1 ring-white/10">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/15">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-black text-white">
                Yönetim Paneli
              </p>
              <p className="truncate text-[11px] text-white/60">Sistem kontrolü</p>
            </div>
          </div>
        </div>

        <nav className="scrollbar-sidebar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-0.5">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.links.map(({ href, label, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group flex h-9 items-center gap-2.5 rounded-xl px-3 text-[12px] font-bold transition",
                        active
                          ? "bg-white text-[#083228] shadow-[0_12px_30px_rgba(0,0,0,.18)]"
                          : "text-white/75 hover:bg-white/10 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? "text-[#087a61]"
                            : "text-white/55 group-hover:text-white",
                        )}
                      />
                      <span className="flex-1 truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 shrink-0 space-y-1 border-t border-white/10 pt-3">
          <Link
            href="/"
            className="flex h-9 items-center gap-2.5 rounded-xl px-3 text-[12px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Siteye Dön
          </Link>
          <button
            type="button"
            onClick={logout}
            className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-[12px] font-bold text-red-200 transition hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
}
