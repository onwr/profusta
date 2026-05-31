"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  MessageCircle,
  Search,
} from "lucide-react";

import { ROUTES } from "@/lib/constants";
import { formatMessageTime } from "@/lib/messages/read-status";
import { cn } from "@/lib/utils";

type ConversationItem = {
  id: string;
  otherName: string;
  listing: {
    id: string;
    title: string;
  } | null;

  lastMessage: {
    body: string | null;
    createdAt: string;
    isMine: boolean;
    readAt: string | null;
  } | null;

  unreadCount: number;
};

type FilterKey = "all" | "unread";

export function ProviderConversationList() {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<FilterKey>("all");

  const load = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.conversations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();

    const interval = setInterval(
      load,
      10000
    );

    return () =>
      clearInterval(interval);
  }, [load]);

  const unreadTotal = useMemo(
    () =>
      items.reduce(
        (s, c) => s + c.unreadCount,
        0
      ),
    [items]
  );

  const filtered = useMemo(() => {
    const q = query
      .trim()
      .toLowerCase();

    return items.filter((c) => {
      if (
        filter === "unread" &&
        c.unreadCount === 0
      )
        return false;

      if (!q) return true;

      return (
        c.otherName
          .toLowerCase()
          .includes(q) ||
        c.listing?.title
          .toLowerCase()
          .includes(q) ||
        c.lastMessage?.body
          ?.toLowerCase()
          .includes(q)
      );
    });
  }, [items, query, filter]);

  return (
    <div className="space-y-6">

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-[30px] font-black text-[#0B1F52]">
            Mesajlarım
          </h1>

          <p className="mt-1 text-sm text-[#64748b]">
            Müşterilerle yaptığınız görüşmeler
          </p>

        </div>

        <div className="rounded-2xl border border-black/5 bg-white px-5 py-3">

          <p className="text-xs text-[#64748b]">
            Okunmamış
          </p>

          <p className="text-xl font-black text-[#087a61]">
            {unreadTotal}
          </p>

        </div>

      </div>

      <section className="overflow-hidden rounded-[30px] border border-black/5 bg-white shadow-sm">

        <div className="border-b border-black/5 p-6">

          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="relative w-full max-w-md">

              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                placeholder="Mesaj ara..."
                className="
                h-12
                w-full
                rounded-2xl
                border
                border-black/5
                bg-[#FBFDF5]
                pl-11
                pr-4
                outline-none
                focus:ring-2
                focus:ring-[#087a61]/10
                "
              />

            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  setFilter("all")
                }
                className={cn(
                  "h-11 rounded-2xl px-5 text-sm font-bold",
                  filter === "all"
                    ? "bg-[#087a61] text-white"
                    : "bg-[#f8fcfa]"
                )}
              >
                Tümü ({items.length})
              </button>

              <button
                onClick={() =>
                  setFilter(
                    "unread"
                  )
                }
                className={cn(
                  "h-11 rounded-2xl px-5 text-sm font-bold",
                  filter ===
                    "unread"
                    ? "bg-[#087a61] text-white"
                    : "bg-[#f8fcfa]"
                )}
              >
                Okunmamış ({unreadTotal})
              </button>

            </div>

          </div>

        </div>

        <div className="p-6">

          {loading ? (
            <div className="flex h-[250px] items-center justify-center">

              <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />

            </div>
          ) : filtered.length ===
            0 ? (
            <div className="rounded-3xl bg-[#FBFDF5] p-10 text-center">

              <MessageCircle className="mx-auto h-10 w-10 text-[#087a61]" />

              <p className="mt-4 font-bold">
                Mesaj bulunamadı
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {filtered.map(
                (conversation) => (
                  <Link
                    key={
                      conversation.id
                    }
                    href={`${ROUTES.provider.messages}/${conversation.id}`}
                    className="flex items-center gap-4 rounded-3xl border border-black/5 bg-[#FBFDF5] p-4 transition hover:border-[#087a61]/20 hover:bg-white"
                  >

                    <div className="relative">

                      <div className="flex h-[55px] w-[55px] items-center justify-center rounded-full bg-gradient-to-br from-[#087a61] to-[#60a5fa] font-black text-white">

                        {conversation.otherName.charAt(
                          0
                        )}

                      </div>

                      {conversation.unreadCount >
                        0 && (
                        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">

                          {
                            conversation.unreadCount
                          }

                        </div>
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="truncate font-black text-[#0B1F52]">

                        {
                          conversation.otherName
                        }

                      </h3>

                      <p className="truncate text-sm text-[#64748b]">

                        {
                          conversation
                            .lastMessage
                            ?.body
                        }

                      </p>

                    </div>

                    <div className="text-xs text-[#94A3B8]">

                      {conversation.lastMessage &&
                        formatMessageTime(
                          conversation
                            .lastMessage
                            .createdAt
                        )}

                    </div>

                  </Link>
                )
              )}

            </div>
          )}

        </div>

      </section>

    </div>
  );
}