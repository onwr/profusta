"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowRight,
  Loader2,
  MessageCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { MessageReadBadge } from "@/components/messages/message-read-badge";
import { ROUTES } from "@/lib/constants";
import { formatMessageTime } from "@/lib/messages/read-status";

type ConversationItem = {
  id: string;
  otherName: string;
  listing: { id: string; title: string } | null;
  lastMessage: {
    body: string | null;
    createdAt: string;
    isMine: boolean;
    readAt: string | null;
  } | null;
  unreadCount: number;
};

export function ConversationList({
  basePath,
}: {
  basePath: typeof ROUTES.customer.messages | typeof ROUTES.provider.messages;
}) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setItems(data.conversations ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-[28px] bg-[#FBFDF5]">
        <div className="flex flex-col items-center gap-3 text-sm font-medium text-[#53635f]">
          <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
          Mesajlar yükleniyor...
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[28px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-10 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-[#087a61]">
          <Sparkles className="h-8 w-8" />
        </div>

        <h3 className="mt-5 text-xl font-black text-[#083228]">
          Henüz mesajınız yok
        </h3>

        <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-[#53635f]">
          Bir usta profili veya ilan üzerinden mesaj başlattığınızda
          konuşmalarınız burada listelenir.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((conversation) => (
        <Link
          key={conversation.id}
          href={`${basePath}/${conversation.id}`}
          className="group rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-0.5 hover:border-[#087a61]/20 hover:bg-white hover:shadow-[0_16px_38px_rgba(8,50,40,0.07)]"
        >
          <div className="flex items-center gap-4">
            <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-white text-xl font-black text-[#087a61] shadow-sm">
              {conversation.otherName?.charAt(0) || (
                <UserRound className="h-7 w-7" />
              )}

              {conversation.unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-6 min-w-6 place-items-center rounded-full bg-[#087a61] px-1.5 text-[11px] font-black text-white ring-2 ring-white">
                  {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-black text-[#083228]">
                  {conversation.otherName}
                </h3>

                {conversation.listing ? (
                  <span className="rounded-full bg-[#eef8f5] px-3 py-1 text-xs font-black text-[#087a61]">
                    {conversation.listing.title}
                  </span>
                ) : null}
              </div>

              {conversation.lastMessage ? (
                <div className="mt-2 flex min-w-0 items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-[#53635f]">
                    {conversation.lastMessage.isMine ? "Siz: " : ""}
                    {conversation.lastMessage.body || "Dosya / ek gönderildi"}
                  </p>

                  {conversation.lastMessage.isMine ? (
                    <MessageReadBadge
                      readAt={conversation.lastMessage.readAt}
                      variant="list"
                    />
                  ) : null}

                  <span className="shrink-0 text-xs font-medium text-[#7b8b87]">
                    {formatMessageTime(conversation.lastMessage.createdAt)}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm font-medium text-[#53635f]">
                  Yeni konuşma
                </p>
              )}
            </div>

            <div className="hidden h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#087a61] shadow-sm transition group-hover:bg-[#087a61] group-hover:text-white sm:grid">
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}