"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  User,
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ROUTES } from "@/lib/constants";
import {
  getHeaderMessagesHref,
  getHeaderPanelHref,
  getHeaderPanelLabel,
  userInitials,
  type HeaderUser,
} from "@/lib/auth/header-user";
import { cn } from "@/lib/utils";

type Props = {
  user: HeaderUser | null;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function HeaderAuthActions({
  user,
  variant = "desktop",
  onNavigate,
}: Props) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMenuOpen(false);
    onNavigate?.();
    router.push(ROUTES.home);
    router.refresh();
  }

  if (!user) {
    if (variant === "mobile") {
      return (
        <div className="flex flex-col gap-2.5">
          <Link
            href={ROUTES.login}
            onClick={onNavigate}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white text-sm font-bold text-[#083228] ring-1 ring-black/10"
          >
            Giriş Yap
          </Link>
          <Link
            href={ROUTES.register}
            onClick={onNavigate}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#f6f8fb] text-sm font-bold text-[#53635f] ring-1 ring-black/10"
          >
            Kayıt Ol
          </Link>
          <Link
            href={ROUTES.providerApply}
            onClick={onNavigate}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#087a61] text-sm font-black text-white"
          >
            Usta Ol
          </Link>
        </div>
      );
    }

    return (
      <>
        <Link
          href={ROUTES.login}
          className="text-sm font-bold text-[#083228] transition hover:text-[#087a61]"
        >
          Giriş Yap
        </Link>
        <Link
          href={ROUTES.register}
          className="text-sm font-bold text-[#53635f] transition hover:text-[#087a61]"
        >
          Kayıt Ol
        </Link>
        <Link
          href={ROUTES.providerApply}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#087a61] px-7 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
        >
          Usta Ol
        </Link>
      </>
    );
  }

  const panelHref = getHeaderPanelHref(user);
  const panelLabel = getHeaderPanelLabel(user);
  const messagesHref = getHeaderMessagesHref(user);

  if (variant === "mobile") {
    return (
      <div className="space-y-2 border-t border-black/5 pt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-black/10">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#087a61] text-sm font-bold text-white">
            {userInitials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#083228]">
              {user.fullName}
            </p>
            <p className="truncate text-xs text-[#7b8b87]">{user.email}</p>
          </div>
          <NotificationBell buttonClassName="h-10 w-10 rounded-full ring-1 ring-black/10" />
        </div>

        <Link
          href={panelHref}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#083228] hover:bg-white"
        >
          <LayoutDashboard className="h-4 w-4 text-[#087a61]" />
          {panelLabel}
        </Link>

        {messagesHref ? (
          <Link
            href={messagesHref}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-[#083228] hover:bg-white"
          >
            <MessageSquare className="h-4 w-4 text-[#087a61]" />
            Mesajlar
          </Link>
        ) : null}

        {user.role === "CUSTOMER" ? (
          <Link
            href={ROUTES.createRequest}
            onClick={onNavigate}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#087a61] text-sm font-bold text-white"
          >
            Talep Oluştur
          </Link>
        ) : null}

        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <>
      <NotificationBell buttonClassName="relative grid h-10 w-10 place-items-center rounded-full bg-white text-[#083228] ring-1 ring-black/10 transition hover:bg-[#eef8f5]" />

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="inline-flex h-11 max-w-[220px] items-center gap-2 rounded-full border border-black/10 bg-white pl-1.5 pr-3 text-sm font-bold text-[#083228] transition hover:border-[#087a61]/30 hover:bg-[#eef8f5]"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#087a61] text-xs font-bold text-white">
            {userInitials(user.fullName)}
          </span>
          <span className="hidden truncate sm:inline">{user.fullName}</span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-[#7b8b87] transition",
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
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-[#7b8b87]">{user.email}</p>
              </div>

              <Link
                href={panelHref}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
              >
                <LayoutDashboard className="h-4 w-4 text-[#087a61]" />
                {panelLabel}
              </Link>

              {messagesHref ? (
                <Link
                  href={messagesHref}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                >
                  <MessageSquare className="h-4 w-4 text-[#087a61]" />
                  Mesajlar
                </Link>
              ) : null}

              {user.role === "CUSTOMER" ? (
                <Link
                  href={ROUTES.createRequest}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#083228] hover:bg-[#eef8f5]"
                >
                  <User className="h-4 w-4 text-[#087a61]" />
                  Talep Oluştur
                </Link>
              ) : null}

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
    </>
  );
}
