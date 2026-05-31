"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCheck,
  Loader2,
  MessageCircle,
  Package,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

type FilterKey = "all" | "unread";

const TYPE_LABELS: Record<string, string> = {
  OFFER: "Teklif",
  MESSAGE: "Mesaj",
  ORDER: "İş / Sipariş",
  PAYMENT: "Ödeme",
  SYSTEM: "Sistem",
};

const TYPE_STYLES: Record<string, string> = {
  OFFER: "bg-[#eef8f5] text-[#087a61]",
  MESSAGE: "bg-[#dcf7e7] text-[#10b981]",
  ORDER: "bg-amber-50 text-amber-700",
  PAYMENT: "bg-[#ede4ff] text-[#7c3aed]",
  SYSTEM: "bg-slate-100 text-slate-600",
};

const TYPE_ICONS: Record<string, typeof Bell> = {
  OFFER: Package,
  MESSAGE: MessageCircle,
  ORDER: Package,
  PAYMENT: Wallet,
  SYSTEM: Sparkles,
};

const PAGE_SIZE = 30;

function formatDate(date: string) {
  return new Date(date).toLocaleString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(date: string) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} saat önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

export function ProviderNotificationsView() {
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("all");

  const load = useCallback(
    (opts?: { offset?: number; append?: boolean; silent?: boolean }) => {
      const offset = opts?.offset ?? 0;
      if (!opts?.silent && !opts?.append) setLoading(true);
      if (opts?.append) setLoadingMore(true);

      const qs = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(offset),
      });
      if (filter === "unread") qs.set("unreadOnly", "true");

      return fetch(`/api/notifications?${qs}`)
        .then((r) => r.json())
        .then((data) => {
          const list = (data.notifications ?? []) as NotificationRow[];
          setItems((prev) => (opts?.append ? [...prev, ...list] : list));
          setUnreadCount(data.unreadCount ?? 0);
          setTotal(data.total ?? list.length);
          setHasMore(data.hasMore ?? false);
          setLoading(false);
          setLoadingMore(false);
        })
        .catch(() => {
          setLoading(false);
          setLoadingMore(false);
        });
    },
    [filter],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    if (filter === "unread") {
      setItems((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    } else {
      setItems((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
        ),
      );
    }
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    setMarkingAll(true);
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    await load({ silent: true });
    setMarkingAll(false);
  }

  function loadMore() {
    if (!hasMore || loadingMore) return;
    void load({ offset: items.length, append: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-black leading-tight text-[#083228]">
            Bildirimler
          </h1>
          <p className="mt-1 text-sm text-[#5a7a72]">
            Talepler, mesajlar ve işlerinizle ilgili güncellemeler
          </p>
        </div>
        {unreadCount > 0 ? (
          <button
            type="button"
            disabled={markingAll}
            onClick={() => void markAllRead()}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#087a61]/30 bg-[#eef8f5] px-5 text-sm font-bold text-[#087a61] hover:bg-[#eef8f5] disabled:opacity-50"
          >
            {markingAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            Tümünü okundu işaretle
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Okunmamış", value: unreadCount, tone: "text-[#ef4444]" },
          { label: "Toplam", value: total, tone: "text-[#083228]" },
          {
            label: "Bu listede",
            value: loading ? "—" : items.length,
            tone: "text-[#087a61]",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <p className="text-xs font-semibold text-[#5a7a72]">{stat.label}</p>
            <p className={cn("mt-1 text-2xl font-black", stat.tone)}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Bildirim filtresi">
          {(
            [
              { key: "all" as const, label: "Tümü" },
              { key: "unread" as const, label: "Okunmamış" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-full px-3.5 py-2 text-xs font-bold transition",
                filter === key
                  ? "bg-[#087a61] text-white shadow-sm"
                  : "bg-[#f8fcfa] text-[#5a7a72] hover:bg-[#eef8f5] hover:text-[#087a61]",
              )}
            >
              {label}
              {key === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <Bell className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#5a7a72]">
              {filter === "unread"
                ? "Okunmamış bildirim yok."
                : "Henüz bildiriminiz yok."}
            </p>
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {items.map((n) => {
                const Icon = TYPE_ICONS[n.type] ?? Bell;
                const isUnread = !n.readAt;
                const inner = (
                  <>
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                        TYPE_STYLES[n.type] ?? "bg-slate-100 text-slate-600",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#083228]">
                          {n.title}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-black",
                            TYPE_STYLES[n.type] ?? "bg-slate-100 text-slate-600",
                          )}
                        >
                          {TYPE_LABELS[n.type] ?? n.type}
                        </span>
                        {isUnread ? (
                          <span className="h-2 w-2 rounded-full bg-[#ef4444]" />
                        ) : null}
                      </span>
                      <span className="mt-1 block text-sm text-[#5a7a72]">
                        {n.body}
                      </span>
                      <span className="mt-1 block text-xs text-[#9ca3af]">
                        {timeAgo(n.createdAt)} · {formatDate(n.createdAt)}
                      </span>
                    </span>
                  </>
                );

                return (
                  <li
                    key={n.id}
                    className={cn(
                      "rounded-xl border border-black/5 transition",
                      isUnread ? "bg-[#eef8f5]" : "bg-[#f8fafc]",
                      "hover:border-[#087a61]/30 hover:bg-white",
                    )}
                  >
                    {n.link ? (
                      <Link
                        href={n.link}
                        onClick={() => {
                          if (isUnread) void markRead(n.id);
                        }}
                        className="flex gap-4 p-4"
                      >
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (isUnread) void markRead(n.id);
                        }}
                        className="flex w-full gap-4 p-4 text-left"
                      >
                        {inner}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {hasMore ? (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  disabled={loadingMore}
                  onClick={loadMore}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 px-5 text-sm font-bold text-[#5a7a72] hover:bg-[#f8fcfa] disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    "Daha fazla yükle"
                  )}
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
}
