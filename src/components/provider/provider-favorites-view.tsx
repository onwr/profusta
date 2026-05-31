"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Heart,
  Loader2,
  MessageCircle,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ProviderFavoriteRow = {
  id: string;
  customerId: string;
  fullName: string;
  avatarUrl: string | null;
  conversationId: string | null;
  completedOrders: number;
  createdAt: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProviderFavoritesView() {
  const [favorites, setFavorites] = useState<ProviderFavoriteRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, withConversation: 0 });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/provider/favorites")
      .then((r) => r.json())
      .then((data) => {
        setFavorites(data.favorites ?? []);
        setSummary(data.summary ?? { total: 0, withConversation: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favorites;
    return favorites.filter((f) => f.fullName.toLowerCase().includes(q));
  }, [favorites, query]);

  const repeatCustomers = useMemo(
    () => favorites.filter((f) => f.completedOrders > 0).length,
    [favorites],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[28px] font-black leading-tight text-[#083228]">
          Favoriler
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          Sizi favorilere ekleyen müşteriler — hızlı iletişim ve ilişki takibi
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Favoriye ekleyen",
            value: summary.total,
            tone: "text-[#087a61]",
            icon: Heart,
          },
          {
            label: "Mesajlaşılan",
            value: summary.withConversation,
            tone: "text-[#10b981]",
            icon: MessageCircle,
          },
          {
            label: "Tamamlanan işi olan",
            value: repeatCustomers,
            tone: "text-[#083228]",
            icon: ShoppingBag,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-black/5 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]">
                <stat.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-[#5a7a72]">{stat.label}</p>
                <p className={cn("text-2xl font-black", stat.tone)}>
                  {loading ? "—" : stat.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:p-6">
        <div className="mb-5 relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Müşteri ara..."
            className="h-11 w-full rounded-xl border border-black/10 bg-[#f8fafc] pl-10 pr-4 text-sm text-[#083228] outline-none focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#087a61]/25 bg-[#eef8f5] p-10 text-center">
            <Heart className="mx-auto h-10 w-10 text-[#087a61]/40" />
            <p className="mt-3 text-sm font-semibold text-[#5a7a72]">
              {favorites.length === 0
                ? "Henüz sizi favorilere ekleyen müşteri yok."
                : "Aramaya uygun müşteri bulunamadı."}
            </p>
            {favorites.length === 0 ? (
              <p className="mt-2 text-xs text-[#9ca3af]">
                Kaliteli hizmet ve iletişimle müşteriler sizi favorilere
                ekleyebilir.
              </p>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((fav) => (
              <li
                key={fav.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border border-black/5 bg-[#f8fafc] p-4 transition hover:border-[#087a61]/30 hover:bg-white"
              >
                {fav.avatarUrl ? (
                  <Image
                    src={fav.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#eef8f5] text-sm font-black text-[#087a61]">
                    {initials(fav.fullName) || (
                      <UserRound className="h-6 w-6" />
                    )}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-[#083228]">{fav.fullName}</p>
                  <p className="mt-0.5 text-xs text-[#5a7a72]">
                    Favoriye eklendi: {formatDate(fav.createdAt)}
                  </p>
                  {fav.completedOrders > 0 ? (
                    <p className="mt-1 text-xs font-semibold text-[#10b981]">
                      {fav.completedOrders} tamamlanan iş
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {fav.conversationId ? (
                    <Link
                      href={`${ROUTES.provider.messages}/${fav.conversationId}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#087a61] px-4 text-xs font-bold text-white hover:bg-[#066b54]"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Mesajlaş
                    </Link>
                  ) : (
                    <span className="inline-flex h-10 items-center rounded-xl border border-black/10 bg-white px-4 text-xs font-semibold text-[#9ca3af]">
                      Henüz sohbet yok
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
