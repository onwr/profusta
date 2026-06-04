"use client";

import Link from "next/link";
import { SiteLogo } from "@/components/layout/site-logo";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  FileText,
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PiggyBank,
  RotateCcw,
  ShoppingBag,
  Star,
  User,
  HelpCircle,
} from "lucide-react";
import { InviteFriendModal } from "@/components/customer/invite-friend-modal";
import { ROUTES } from "@/lib/constants";
import type { CustomerNavCounts } from "@/lib/customer/dashboard-data";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: keyof Pick<
    CustomerNavCounts,
    "pendingOffersCount" | "unreadMessagesCount"
  >;
};

const links: NavLink[] = [
  { href: ROUTES.customer.dashboard, label: "Ana Sayfa", icon: Home },
  {
    href: ROUTES.customer.requests,
    label: "Hizmet Taleplerim",
    icon: ClipboardList,
  },
  {
    href: ROUTES.customer.offers,
    label: "Tekliflerim",
    icon: FileText,
    badgeKey: "pendingOffersCount",
  },
  { href: ROUTES.customer.orders, label: "Siparişlerim", icon: ShoppingBag },
  {
    href: ROUTES.customer.messages,
    label: "Mesajlarım",
    icon: MessageCircle,
    badgeKey: "unreadMessagesCount",
  },
  { href: ROUTES.customer.favorites, label: "Favori Ustalarım", icon: Heart },
  { href: ROUTES.customer.reviews, label: "Değerlendirmelerim", icon: Star },
  { href: ROUTES.customer.profile, label: "Profilim", icon: User },
  {
    href: ROUTES.customer.refundsDisputes,
    label: "İade & İtiraz",
    icon: RotateCcw,
  },
];

type Props = {
  userId: string;
  navCounts: CustomerNavCounts;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

function SidebarContent({
  userId,
  navCounts,
  onMobileClose,
}: {
  userId: string;
  navCounts: CustomerNavCounts;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    if (href === ROUTES.customer.dashboard) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="flex h-full max-h-dvh flex-col overflow-hidden p-4">
        <div className="shrink-0">
          <Link
            href={ROUTES.customer.dashboard}
            className="mb-4 block px-2"
            onClick={onMobileClose}
          >
            <SiteLogo
              width={150}
              height={44}
              priority
              className="h-8 brightness-0 invert"
            />
          </Link>

          <div className="mb-3 rounded-[22px] bg-white/10 p-3 ring-1 ring-white/10">
            <div className="flex items-center gap-2.5">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#087a61]">
                <Home className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[13px] font-black text-white">Müşteri Paneli</p>
                <p className="text-[11px] font-medium text-white/60">
                  Hizmetlerini yönet
                </p>
              </div>
            </div>
          </div>
        </div>

        <nav className="scrollbar-sidebar min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pr-0.5">
          {links.map(({ href, label, icon: Icon, badgeKey }) => {
            const active = isActive(href);
            const badge =
              badgeKey && navCounts[badgeKey] > 0 ? navCounts[badgeKey] : null;

            return (
              <Link
                key={href}
                href={href}
                onClick={onMobileClose}
                className={cn(
                  "group flex h-10 items-center gap-2.5 rounded-xl px-3 text-[13px] font-bold transition",
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
                      : "text-white/60 group-hover:text-white",
                  )}
                />
                <span className="flex-1">{label}</span>
                {badge != null ? (
                  <span
                    className={cn(
                      "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-black",
                      active ? "bg-[#087a61] text-white" : "bg-red-500 text-white",
                    )}
                  >
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 shrink-0 space-y-1.5 border-t border-white/10 pt-3">
          <div className="rounded-[18px] bg-[#0b8067] p-3 shadow-[0_14px_32px_rgba(0,0,0,.15)]">
            <div className="mb-2 grid h-8 w-8 place-items-center rounded-lg bg-white/15 text-white">
              <PiggyBank className="h-4 w-4" />
            </div>
            <h3 className="text-[13px] font-black text-white">Arkadaşını Davet Et</h3>
            <p className="mt-1 text-[11px] leading-4 text-white/70">
              Linki paylaş, arkadaşın kayıt olsun.
            </p>
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="mt-2 h-9 w-full rounded-xl bg-white text-[13px] font-black text-[#087a61] transition hover:bg-[#eef8f5]"
            >
              Davet Et
            </button>
          </div>

          <Link
            href={ROUTES.static.faq}
            onClick={onMobileClose}
            className="flex h-9 items-center gap-2.5 rounded-xl px-3 text-[13px] font-bold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            Yardım & Destek
          </Link>

          <button
            type="button"
            onClick={logout}
            className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-[13px] font-bold text-red-200 transition hover:bg-red-500/15 hover:text-red-100"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Çıkış Yap
          </button>
        </div>
      </div>

      <InviteFriendModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        userId={userId}
      />
    </>
  );
}

export function CustomerSidebar({
  userId,
  navCounts,
  mobileOpen,
  onMobileClose,
}: Props) {
  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 bg-gradient-to-b from-[#06291f] via-[#07372b] to-[#041b15] lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[280px] lg:flex-col lg:self-start",
        )}
      >
        <SidebarContent
          userId={userId}
          navCounts={navCounts}
          onMobileClose={onMobileClose}
        />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Menüyü kapat"
            onClick={onMobileClose}
          />
          <aside className="relative flex h-dvh max-h-dvh w-[min(310px,86vw)] flex-col overflow-hidden bg-gradient-to-b from-[#06291f] via-[#07372b] to-[#041b15] shadow-2xl">
            <SidebarContent
              userId={userId}
              navCounts={navCounts}
              onMobileClose={onMobileClose}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}
