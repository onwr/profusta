"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BadgeCheck,
  Bell,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Heart,
  Home,
  LogOut,
  MapPin,
  Megaphone,
  MessageCircle,
  ShieldCheck,
  Star,
  Tags,
  User,
  Wallet,
} from "lucide-react";
import { ProviderAvatar } from "@/components/provider/provider-avatar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import type { ProviderNavCounts } from "@/lib/provider/dashboard-data";
import { cn } from "@/lib/utils";

type Tone = "red" | "blue";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: keyof Pick<
    ProviderNavCounts,
    "newRequestsCount" | "activeJobsCount" | "unreadMessagesCount"
  >;
  badgeTone?: Tone;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavLink[];
};

const navSections: NavSection[] = [
  {
    title: "Ana Menü",
    items: [
      { href: ROUTES.provider.dashboard, label: "Anasayfa", icon: Home },
      {
        href: ROUTES.provider.requests,
        label: "Gelen Talepler",
        icon: ClipboardList,
        badgeKey: "newRequestsCount",
        badgeTone: "red",
      },
      { href: ROUTES.provider.offers, label: "Tekliflerim", icon: FileText },
      {
        href: ROUTES.provider.jobs,
        label: "Aktif İşlerim",
        icon: Briefcase,
        badgeKey: "activeJobsCount",
        badgeTone: "blue",
      },
      {
        href: ROUTES.provider.jobsCompleted,
        label: "Tamamlanan İşler",
        icon: CheckCircle2,
      },
    ],
  },
  {
    title: "İşletmen",
    items: [
      { href: ROUTES.provider.listings, label: "İlanlarım", icon: Megaphone },
      { href: ROUTES.provider.categories, label: "Kategorilerim", icon: Tags },
      { href: ROUTES.provider.areas, label: "Hizmet Bölgelerim", icon: MapPin },
    ],
  },
  {
    title: "İletişim",
    items: [
      {
        href: ROUTES.provider.messages,
        label: "Mesajlarım",
        icon: MessageCircle,
        badgeKey: "unreadMessagesCount",
        badgeTone: "blue",
      },
      {
        href: ROUTES.provider.notifications,
        label: "Bildirimler",
        icon: Bell,
      },
    ],
  },
  {
    title: "Finans",
    items: [
      { href: ROUTES.provider.earnings, label: "Kazançlarım", icon: Wallet },
      {
        href: ROUTES.provider.payouts,
        label: "Ödeme Talepleri",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Diğer",
    items: [
      { href: ROUTES.provider.reviews, label: "Değerlendirmeler", icon: Star },
      { href: ROUTES.provider.favorites, label: "Favoriler", icon: Heart },
      { href: ROUTES.provider.profile, label: "Profilim", icon: User },
    ],
  },
];

type Props = {
  userName: string;
  avatarUrl: string | null;
  profession: string;
  ratingAvg: number | null;
  reviewCount: number;
  navCounts: ProviderNavCounts;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

export function ProviderSidebar(props: Props) {
  const { mobileOpen, onMobileClose, ...content } = props;

  return (
    <>
      <aside className="hidden shrink-0 overflow-hidden bg-linear-to-b from-[#06291f] via-[#07372b] to-[#041b15] text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[260px] lg:flex-col lg:self-start">
        <SidebarContent {...content} onMobileClose={onMobileClose} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Menüyü kapat"
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          <aside className="relative flex h-dvh max-h-dvh w-[min(292px,86vw)] flex-col overflow-hidden bg-linear-to-b from-[#06291f] via-[#07372b] to-[#041b15] text-white shadow-2xl">
            <SidebarContent {...content} onMobileClose={onMobileClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarContent({
  userName,
  avatarUrl,
  profession,
  ratingAvg,
  reviewCount,
  navCounts,
  onMobileClose,
}: Omit<Props, "mobileOpen">) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    const path = href.split("#")[0];

    if (path === ROUTES.provider.dashboard) return pathname === path;

    if (path === ROUTES.provider.jobsCompleted) {
      return pathname.startsWith(ROUTES.provider.jobsCompleted);
    }

    if (path === ROUTES.provider.jobs) {
      return (
        pathname === path ||
        (pathname.startsWith(`${path}/`) &&
          !pathname.startsWith(ROUTES.provider.jobsCompleted))
      );
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative flex h-full max-h-dvh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.28),transparent_36%),linear-gradient(180deg,#064a3f_0%,#06291f_48%,#041b15_100%)]" />

      <div className="relative z-10 flex h-full flex-col overflow-hidden p-3.5">
        <div className="shrink-0">
          <Link
            href={ROUTES.provider.dashboard}
            onClick={onMobileClose}
            className="mb-3 flex h-9 items-center px-1"
          >
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={142}
              height={40}
              className="h-7 w-auto object-contain brightness-0 invert"
              priority
            />
          </Link>

          <div className="mb-4 rounded-[20px] border border-white/10 bg-white/[0.075] p-2.5 shadow-[0_14px_32px_rgba(0,0,0,0.16)] backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <ProviderAvatar
                userName={userName}
                avatarUrl={avatarUrl}
                size="sm"
                editable
                showVerifiedBadge
              />

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[12px] font-black text-white">
                  {userName}
                  <BadgeCheck className="h-3.5 w-3.5 shrink-0 fill-emerald-400/20 text-emerald-300" />
                </p>

                <p className="mt-0.5 truncate text-[10.5px] font-medium text-white/60">
                  {profession}
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  {ratingAvg != null ? (
                    <div className="flex h-5 items-center gap-1 rounded-full bg-white/10 px-2 text-[10px] text-white">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="font-black">{ratingAvg}</span>
                      <span className="text-white/55">({reviewCount})</span>
                    </div>
                  ) : null}

                  <div className="flex h-5 items-center gap-1 rounded-full bg-emerald-400/15 px-2 text-[10px] font-bold text-emerald-200">
                    <ShieldCheck className="h-3 w-3" />
                    Onaylı
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="scrollbar-sidebar min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain pr-1">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="mb-1.5 px-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                {section.title}
              </p>

              <div className="space-y-0.5">
                {section.items.map(
                  ({
                    href,
                    label,
                    icon: Icon,
                    badgeKey,
                    badgeTone,
                    disabled,
                  }) => {
                    const active = !disabled && isActive(href);

                    const badge =
                      badgeKey && navCounts[badgeKey] > 0
                        ? navCounts[badgeKey]
                        : null;

                    if (disabled) {
                      return (
                        <span
                          key={label}
                          title="Yakında"
                          className="flex h-8 cursor-not-allowed items-center gap-2.5 rounded-xl px-2.5 text-[11.5px] font-bold text-white/30"
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="flex-1 truncate">{label}</span>
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={label}
                        href={href}
                        onClick={onMobileClose}
                        className={cn(
                          "group relative flex h-8 items-center gap-2.5 rounded-xl px-2.5 text-[11.5px] font-bold transition-all duration-200",
                          active
                            ? "bg-white text-[#083228] shadow-[0_10px_26px_rgba(0,0,0,0.18)]"
                            : "text-white/75 hover:bg-white/10 hover:text-white",
                        )}
                      >
                        {active ? (
                          <span className="absolute left-0 top-1/2 h-4 w-1 -translate-y-1/2 rounded-r-full bg-[#087a61]" />
                        ) : null}

                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-lg transition",
                            active
                              ? "bg-[#eef8f5] text-[#087a61]"
                              : "bg-white/[0.06] text-white/55 group-hover:bg-white/10 group-hover:text-white",
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>

                        <span className="min-w-0 flex-1 truncate">{label}</span>

                        {badge != null ? (
                          <span
                            className={cn(
                              "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-black",
                              active
                                ? "bg-[#087a61] text-white"
                                : badgeTone === "red"
                                  ? "bg-red-500 text-white"
                                  : "bg-[#087a61] text-white",
                            )}
                          >
                            {badge > 9 ? "9+" : badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 shrink-0 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={logout}
            className="flex h-8 w-full items-center gap-2.5 rounded-xl px-2.5 text-[11.5px] font-bold text-red-200 transition hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}