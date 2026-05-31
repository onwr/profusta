"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

type NotificationBellProps = {
  buttonClassName?: string;
  /** Usta paneli top bar stili */
  variant?: "default" | "provider";
};

export function NotificationBell({
  buttonClassName,
  variant = "default",
}: NotificationBellProps) {
  const isProvider = variant === "provider";
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(() => {
    fetch("/api/notifications?limit=15")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.notifications ?? []);
        setUnread(d.unreadCount ?? 0);
      });
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    load();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ??
          (isProvider
            ? "relative grid h-10 w-10 place-items-center rounded-full text-[#0c2654] hover:bg-black/5"
            : "relative flex h-10 w-10 items-center justify-center rounded-xl border border-black/5 bg-white text-[#083228] hover:bg-[#eef8f5]")
        }
        aria-label="Bildirimler"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span
            className={cn(
              "absolute flex min-w-4 place-items-center rounded-full px-1 text-[9px] font-black text-white",
              isProvider
                ? "right-1 top-1 grid h-4 bg-[#ef4444] ring-2 ring-white"
                : "-right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-[#087a61] text-[10px] font-bold",
            )}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-black/5 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
              <span
                className={cn(
                  "text-sm font-bold",
                  isProvider ? "text-[#0c2654]" : "text-[#083228]",
                )}
              >
                Bildirimler
              </span>
              {unread > 0 ? (
                <button
                  type="button"
                  onClick={markAllRead}
                  className={cn(
                    "text-xs font-semibold hover:underline",
                    isProvider ? "text-[#2563eb]" : "text-[#087a61]",
                  )}
                >
                  Tümünü oku
                </button>
              ) : null}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <li
                  className={cn(
                    "px-4 py-6 text-center text-sm",
                    isProvider ? "text-[#6b7280]" : "text-[#53635f]",
                  )}
                >
                  Bildirim yok
                </li>
              ) : (
                items.map((n) => (
                  <li key={n.id} className="border-b border-black/5 last:border-0">
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (!n.readAt) markRead(n.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "block px-4 py-3 text-sm",
                          isProvider
                            ? "hover:bg-[#f0f5ff]"
                            : "hover:bg-[#eef8f5]",
                          !n.readAt &&
                            (isProvider ? "bg-[#f0f5ff]/60" : "bg-[#eef8f5]/50"),
                        )}
                      >
                        <p
                          className={cn(
                            "font-semibold",
                            isProvider ? "text-[#0c2654]" : "text-[#083228]",
                          )}
                        >
                          {n.title}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 line-clamp-2 text-xs",
                            isProvider ? "text-[#6b7280]" : "text-[#53635f]",
                          )}
                        >
                          {n.body}
                        </p>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => !n.readAt && markRead(n.id)}
                        className={cn(
                          "block w-full px-4 py-3 text-left text-sm",
                          isProvider ? "hover:bg-[#f0f5ff]" : "hover:bg-[#eef8f5]",
                        )}
                      >
                        <p
                          className={cn(
                            "font-semibold",
                            isProvider ? "text-[#0c2654]" : "text-[#083228]",
                          )}
                        >
                          {n.title}
                        </p>
                        <p
                          className={cn(
                            "mt-0.5 text-xs",
                            isProvider ? "text-[#6b7280]" : "text-[#53635f]",
                          )}
                        >
                          {n.body}
                        </p>
                      </button>
                    )}
                  </li>
                ))
              )}
            </ul>
            {isProvider ? (
              <div className="border-t border-black/5 p-2">
                <Link
                  href={ROUTES.provider.notifications}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl py-2.5 text-center text-xs font-bold text-[#2563eb] hover:bg-[#f0f5ff]"
                >
                  Tüm bildirimleri gör
                </Link>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
