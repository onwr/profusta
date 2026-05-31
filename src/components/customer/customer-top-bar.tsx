"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Sparkles,
  User,
} from "lucide-react";
import { HeaderLocationPicker } from "@/components/layout/header-location-picker";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  userName: string;
  unreadMessagesCount: number;
  className?: string;
  onMenuClick?: () => void;
};

export function CustomerTopBar({
  userName,
  unreadMessagesCount,
  className,
  onMenuClick,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") ?? "").trim();

    router.push(
      q ? `${ROUTES.categories}?q=${encodeURIComponent(q)}` : ROUTES.categories,
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-black/5 bg-white/90 backdrop-blur-xl",
        className,
      )}
    >
      <div className="flex min-h-[84px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-12 w-12 place-items-center rounded-2xl border border-black/5 bg-[#f4f8f6] text-[#083228] transition hover:bg-[#eef8f5] lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="h-5 w-5" />
        </button>

        <HeaderLocationPicker
          className="hidden shrink-0 xl:block"
          variant="desktop"
        />

        <form onSubmit={onSearch} className="min-w-0 flex-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#7b8b87]" />

            <input
              name="q"
              type="search"
              placeholder="Kategori, hizmet veya usta ara..."
              className="h-14 w-full rounded-2xl border border-black/5 bg-[#f7f7f3] pl-14 pr-5 text-[15px] font-medium text-[#083228] outline-none transition placeholder:text-[#8b9b96] focus:border-[#087a61]/30 focus:bg-white focus:ring-4 focus:ring-[#087a61]/10"
            />
          </div>
        </form>

        <Link
          href={ROUTES.createRequest}
          className="hidden h-12 items-center gap-2 rounded-2xl bg-[#087a61] px-5 text-sm font-black text-white shadow-[0_12px_28px_rgba(8,122,97,.22)] transition hover:bg-[#06644f] xl:inline-flex"
        >
          <Sparkles className="h-4 w-4" />
          Yeni Talep
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <IconButton
            href={ROUTES.customer.messages}
            label="Mesajlar"
            count={unreadMessagesCount}
            icon={<MessageCircle className="h-5 w-5" />}
          />

          <NotificationBell buttonClassName="relative grid h-12 w-12 place-items-center rounded-2xl border border-black/5 bg-white text-[#083228] shadow-sm transition hover:bg-[#f4f8f6]" />

          <div className="relative ml-2 hidden sm:block">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white py-2 pl-2 pr-4 shadow-sm transition hover:bg-[#f4f8f6]"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#eef8f5] text-base font-black text-[#087a61]">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 text-left">
                <p className="max-w-[130px] truncate text-sm font-black leading-tight text-[#083228]">
                  {userName}
                </p>
                <p className="mt-0.5 text-xs font-medium text-[#53635f]">
                  Müşteri
                </p>
              </div>

              <ChevronDown
                className={cn(
                  "h-4 w-4 text-[#7b8b87] transition",
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
                    <p className="text-xs text-[#53635f]">Müşteri hesabı</p>
                  </div>

                  <Link
                    href={ROUTES.customer.dashboard}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#087a61]" />
                    Panel
                  </Link>

                  <Link
                    href={ROUTES.createRequest}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <Sparkles className="h-4 w-4 text-[#087a61]" />
                    Yeni Talep
                  </Link>

                  <Link
                    href={ROUTES.customer.messages}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <MessageCircle className="h-4 w-4 text-[#087a61]" />
                    Mesajlarım
                    {unreadMessagesCount > 0 ? (
                      <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#087a61] px-1.5 text-[10px] font-black text-white">
                        {unreadMessagesCount > 9 ? "9+" : unreadMessagesCount}
                      </span>
                    ) : null}
                  </Link>

                  <Link
                    href={ROUTES.customer.favorites}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <Heart className="h-4 w-4 text-[#087a61]" />
                    Favorilerim
                  </Link>

                  <Link
                    href={ROUTES.customer.profile}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <User className="h-4 w-4 text-[#087a61]" />
                    Profilim
                  </Link>

                  <Link
                    href={ROUTES.customer.orders}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                  >
                    <User className="h-4 w-4 text-[#087a61]" />
                    Siparişlerim
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
      </div>
    </header>
  );
}

function IconButton({
  href,
  label,
  count,
  icon,
}: {
  href: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="relative grid h-12 w-12 place-items-center rounded-2xl border border-black/5 bg-white text-[#083228] shadow-sm transition hover:bg-[#f4f8f6]"
      aria-label={label}
    >
      {icon}
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#087a61] px-1 text-[10px] font-black text-white ring-2 ring-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
