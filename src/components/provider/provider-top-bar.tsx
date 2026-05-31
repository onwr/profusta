"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  User,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ProviderAvatar } from "@/components/provider/provider-avatar";
import { ROUTES } from "@/lib/constants";
import type { ProviderNavCounts } from "@/lib/provider/dashboard-data";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  avatarUrl: string | null;
  profession: string;
  navCounts: ProviderNavCounts;
  onMobileMenuOpen?: () => void;
};

export function ProviderTopBar({
  userName,
  avatarUrl,
  profession,
  navCounts,
  onMobileMenuOpen,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-black/[0.04] bg-white px-4 py-3 lg:px-8">
      <button
        type="button"
        onClick={onMobileMenuOpen}
        aria-label="Menü"
        className="grid h-10 w-10 place-items-center rounded-lg text-[#083228] hover:bg-[#eef8f5]"
      >
        <Menu className="h-5 w-5" />
      </button>

      <Link
        href={ROUTES.provider.requests}
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#083228] shadow-[0_1px_2px_rgba(8,50,40,0.06)] ring-1 ring-black/5 transition hover:bg-[#eef8f5]"
      >
        <ClipboardList className="h-4 w-4 text-[#087a61]" />
        <span>Teklif &amp; Talepler</span>
        {navCounts.newRequestsCount > 0 ? (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-black text-white">
            {navCounts.newRequestsCount > 9 ? "9+" : navCounts.newRequestsCount}
          </span>
        ) : null}
      </Link>

      <div className="ml-auto flex items-center gap-1.5">
        <Link
          href={ROUTES.provider.messages}
          aria-label="Mesajlar"
          className="relative grid h-10 w-10 place-items-center rounded-full text-[#083228] hover:bg-[#eef8f5]"
        >
          <MessageCircle className="h-5 w-5" />
          {navCounts.unreadMessagesCount > 0 ? (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#ef4444] px-1 text-[9px] font-black text-white ring-2 ring-white">
              {navCounts.unreadMessagesCount > 9
                ? "9+"
                : navCounts.unreadMessagesCount}
            </span>
          ) : null}
        </Link>

        <NotificationBell variant="provider" />

        <div className="relative ml-1">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition hover:bg-[#eef8f5]"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <ProviderAvatar userName={userName} avatarUrl={avatarUrl} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="max-w-[140px] truncate text-sm font-bold leading-tight text-[#083228]">
                {userName}
              </p>
              <p className="max-w-[140px] truncate text-xs text-[#5a7a72]">
                {profession}
              </p>
            </div>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-[#5a7a72] transition sm:block",
                menuOpen && "rotate-180",
              )}
            />
          </button>

          {menuOpen ? (
            <>
              <button
                type="button"
                className="fixed inset-0 z-40"
                aria-label="Menüyü kapat"
                onClick={() => setMenuOpen(false)}
              />
              <div
                role="menu"
                className="absolute right-0 z-50 mt-2 w-56 rounded-2xl border border-black/5 bg-white py-2 shadow-lg"
              >
                <div className="border-b border-black/5 px-4 py-3">
                  <p className="truncate text-sm font-bold text-[#083228]">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-[#5a7a72]">{profession}</p>
                </div>

                <Link
                  href={ROUTES.provider.dashboard}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                >
                  <LayoutDashboard className="h-4 w-4 text-[#087a61]" />
                  Panel
                </Link>

                <Link
                  href={ROUTES.provider.profile}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                >
                  <User className="h-4 w-4 text-[#087a61]" />
                  Profilim
                </Link>

                <Link
                  href={ROUTES.provider.messages}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                >
                  <MessageCircle className="h-4 w-4 text-[#087a61]" />
                  Mesajlarım
                  {navCounts.unreadMessagesCount > 0 ? (
                    <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#ef4444] px-1.5 text-[10px] font-black text-white">
                      {navCounts.unreadMessagesCount > 9
                        ? "9+"
                        : navCounts.unreadMessagesCount}
                    </span>
                  ) : null}
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Çıkış Yap
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
