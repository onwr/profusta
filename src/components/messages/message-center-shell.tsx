"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  CreditCard,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { ChatThread } from "@/components/messages/chat-thread";
import { formatMessageTime } from "@/lib/messages/read-status";
import { formatProviderConversationSubtitle } from "@/lib/providers/conversation-stats-format";
import { cn } from "@/lib/utils";

type Role = "customer" | "provider";
type FilterKey = "all" | "active" | "archive";
type OfferStatus = "PENDING" | "ACCEPTED" | "REJECTED";

type ConversationItem = {
  id: string;
  otherName: string;
  otherAvatarUrl?: string | null;
  listing: {
    id: string;
    title: string;
    description?: string | null;
    price?: number | null;
    city?: string | null;
    district?: string | null;
    createdAt?: string;
  } | null;
  latestOffer?: {
    id: string;
    status: OfferStatus;
    price: number;
    title?: string;
    createdAt: string;
    scheduledAt?: string | null;
  } | null;
  lastMessage: {
    body: string | null;
    createdAt: string;
    isMine: boolean;
    readAt: string | null;
  } | null;
  unreadCount: number;
  otherProviderStats?: {
    ratingAvg: number | null;
    reviewCount: number;
    completedOrderCount: number;
    baseCity: string | null;
    baseDistrict: string | null;
  } | null;
};

const filterLabels: Record<FilterKey, string> = {
  all: "Tümü",
  active: "Aktif",
  archive: "Arşiv",
};

function initials(name: string) {
  const value = name
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  return value.toUpperCase() || "?";
}

function formatCurrency(value?: number | null) {
  if (value == null) return "Belirtilmedi";
  return `${value.toLocaleString("tr-TR")} TL`;
}

function formatDate(value?: string | null) {
  if (!value) return "Tarih belirtilmedi";
  return new Date(value).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status?: OfferStatus) {
  if (status === "ACCEPTED") return "Teklif Kabul Edildi";
  if (status === "REJECTED") return "Teklif Reddedildi";
  if (status === "PENDING") return "Teklif Aşamasında";
  return "Görüşme Devam Ediyor";
}

function isActiveConversation(item: ConversationItem) {
  return item.unreadCount > 0 || item.latestOffer?.status === "PENDING";
}

export function MessageCenterShell({
  role,
  selectedConversationId,
  currentUserId,
  basePath,
}: {
  role: Role;
  selectedConversationId?: string;
  currentUserId: string;
  basePath: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeId, setActiveId] = useState<string | null>(
    selectedConversationId ?? null,
  );

  const load = useCallback(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setItems(data.conversations ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    queueMicrotask(() => setActiveId(selectedConversationId ?? null));
  }, [selectedConversationId]);

  const unreadTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unreadCount, 0),
    [items],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter === "active" && !isActiveConversation(item)) return false;
      if (filter === "archive" && isActiveConversation(item)) return false;
      if (!q) return true;
      return (
        item.otherName.toLowerCase().includes(q) ||
        item.listing?.title.toLowerCase().includes(q) ||
        item.lastMessage?.body?.toLowerCase().includes(q)
      );
    });
  }, [filter, items, query]);

  const activeConversation =
    items.find((item) => item.id === activeId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (loading || items.length === 0 || activeId) return;
    const first = items[0];
    queueMicrotask(() => setActiveId(first.id));
    if (pathname === basePath) router.replace(`${basePath}/${first.id}`);
  }, [activeId, basePath, items, loading, pathname, router]);

  function selectConversation(id: string) {
    setActiveId(id);
    router.push(`${basePath}/${id}`);
  }

  const accent = "#087a61";
  const accentLight = "#eef8f5";

  return (
    <section
      className="overflow-hidden rounded-[18px] border border-black/5 bg-white shadow-[0_8px_30px_rgba(8,50,40,0.05)]"
      style={
        {
          "--msg-accent": accent,
          "--msg-accent-light": accentLight,
        } as React.CSSProperties
      }
    >
      <div className="grid min-h-[680px] grid-cols-1 bg-white lg:h-[calc(100vh-8.5rem)] lg:grid-cols-[270px_minmax(0,1fr)] xl:grid-cols-[270px_minmax(0,1fr)_285px]">
        <aside className="flex min-h-[520px] flex-col border-b border-[#edf0f5] bg-white lg:border-b-0 lg:border-r">
          <div className="border-b border-[#edf0f5] p-4">
            <h1 className="text-lg font-black text-[#083228]">Mesajlarım</h1>
            <div className="mt-4 flex items-center gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b98aa]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Ara..."
                  className="h-10 w-full rounded-lg border border-[#edf0f5] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--msg-accent)]/30 focus:ring-2 focus:ring-[color:var(--msg-accent)]/10"
                />
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-lg border border-[#edf0f5] text-[#64748b] hover:bg-[#f8fafc]"
                aria-label="Filtreler"
              >
                <Bell className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 flex items-center gap-5 text-sm font-semibold text-[#64748b]">
              {(Object.keys(filterLabels) as FilterKey[]).map((key) => {
                const count =
                  key === "all"
                    ? items.length
                    : key === "active"
                      ? items.filter(isActiveConversation).length
                      : items.filter((item) => !isActiveConversation(item)).length;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFilter(key)}
                    className={cn(
                      "relative pb-2 transition",
                      filter === key ? "text-[color:var(--msg-accent)]" : "hover:text-[#083228]",
                    )}
                  >
                    {filterLabels[key]}
                    {count > 0 && key === "all" ? (
                      <span className="ml-1 rounded-full bg-[#1f7cff] px-1.5 py-0.5 text-[10px] font-black text-white">
                        {unreadTotal || count}
                      </span>
                    ) : null}
                    {filter === key ? (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[color:var(--msg-accent)]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="grid h-full place-items-center text-sm text-[#64748b]">
                Mesajlar yükleniyor...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#d9e0ea] p-6 text-center text-sm text-[#64748b]">
                Mesaj bulunamadı.
              </div>
            ) : (
              <ul className="space-y-1">
                {filtered.map((conversation) => {
                  const active = conversation.id === activeConversation?.id;
                  return (
                    <li key={conversation.id}>
                      <button
                        type="button"
                        onClick={() => selectConversation(conversation.id)}
                        className={cn(
                          "w-full rounded-xl px-3 py-3 text-left transition",
                          active
                            ? "bg-[#f0fdf8]"
                            : "hover:bg-[#f8fafc]",
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f2f6fb] text-sm font-black text-[#083228]">
                            {initials(conversation.otherName)}
                            <span className="absolute -right-0.5 bottom-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-[color:var(--msg-accent)]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-black text-[#083228]">
                                {conversation.otherName}
                              </p>
                              <span className="shrink-0 text-[10px] font-medium text-[#8b98aa]">
                                {conversation.lastMessage
                                  ? formatMessageTime(
                                      conversation.lastMessage.createdAt,
                                    )
                                  : ""}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs font-semibold text-[#64748b]">
                              {conversation.listing?.title ?? "Genel Görüşme"}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <p className="min-w-0 flex-1 truncate text-xs text-[#64748b]">
                                {conversation.lastMessage?.isMine ? "Siz: " : ""}
                                {conversation.lastMessage?.body ?? "Yeni konuşma"}
                              </p>
                              {conversation.unreadCount > 0 ? (
                                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#1f7cff] px-1.5 text-[10px] font-black text-white">
                                  {conversation.unreadCount}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <main className="flex min-h-[620px] flex-col bg-[#fbfaf7]">
          {activeConversation ? (
            <>
              <div className="flex min-h-20 items-center justify-between border-b border-[#edf0f5] bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative grid h-12 w-12 place-items-center rounded-full bg-[#f2f6fb] font-black text-[#083228]">
                    {initials(activeConversation.otherName)}
                    <span className="absolute -right-0.5 bottom-1 h-3 w-3 rounded-full border-2 border-white bg-[color:var(--msg-accent)]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-black text-[#083228]">
                        {activeConversation.otherName}
                      </h2>
                      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-[color:var(--msg-accent)]" style={{ backgroundColor: "var(--msg-accent-light)" }}>
                        <CheckCircle2 className="h-3 w-3" />
                        {role === "customer" ? "Onaylı usta" : "Müşteri"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#64748b]">
                      {role === "customer"
                        ? activeConversation.otherProviderStats
                          ? formatProviderConversationSubtitle(
                              activeConversation.otherProviderStats,
                            )
                          : "Usta profili"
                        : "Müşteri görüşmesi"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-b border-[#edf0f5] bg-white px-5 py-2 text-center text-[11px] font-medium text-[#64748b]">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-[color:var(--msg-accent)]" />
                Bu konuşmadaki bilgiler ve ödemeler ProfUsta güvencesi altındadır.
              </div>
              <ChatThread
                conversationId={activeConversation.id}
                currentUserId={currentUserId}
                isCustomer={role === "customer"}
                otherName={activeConversation.otherName}
                variant="messageCenter"
              />
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-sm text-[#64748b]">
              Bir konuşma seçin.
            </div>
          )}
        </main>

        <aside className="hidden overflow-y-auto border-l border-[#edf0f5] bg-white xl:block">
          {activeConversation ? (
            <RightPanel conversation={activeConversation} role={role} />
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function RightPanel({
  conversation,
  role,
}: {
  conversation: ConversationItem;
  role: Role;
}) {
  return (
    <div className="space-y-4 p-4">
      <section className="rounded-xl border border-[#edf0f5] bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#083228]">Talep Bilgileri</h3>
          <span className="text-[11px] font-semibold text-[#8b98aa]">#{conversation.id.slice(-5)}</span>
        </div>
        <p className="text-sm font-bold text-[#083228]">
          {conversation.listing?.title ?? "Hizmet Görüşmesi"}
        </p>
        <p className="mt-2 text-xs text-[#64748b]">
          {formatDate(conversation.latestOffer?.scheduledAt ?? conversation.listing?.createdAt)}
        </p>
        <span className="mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold text-[color:var(--msg-accent)]" style={{ backgroundColor: "var(--msg-accent-light)" }}>
          {statusLabel(conversation.latestOffer?.status)}
        </span>
      </section>

      <section className="rounded-xl border border-[#edf0f5] bg-white p-4">
        <h3 className="text-sm font-black text-[#083228]">Adres</h3>
        <p className="mt-2 text-xs leading-5 text-[#64748b]">
          {conversation.listing?.district || conversation.listing?.city
            ? `${conversation.listing?.district ?? ""}${conversation.listing?.district && conversation.listing?.city ? " / " : ""}${conversation.listing?.city ?? ""}`
            : "Adres bilgisi görüşme içinde paylaşılacak."}
        </p>
      </section>

      <section className="rounded-xl border border-[#edf0f5] bg-white p-4">
        <h3 className="text-sm font-black text-[#083228]">Talep Detayı</h3>
        <p className="mt-2 text-xs leading-5 text-[#64748b]">
          {conversation.listing?.description ??
            "Detaylar görüşme mesajları üzerinden netleştirilecek."}
        </p>
        <button
          type="button"
          className="mt-3 h-9 w-full rounded-lg border border-[#edf0f5] text-xs font-bold text-[#087a61] hover:bg-[#f8fafc]"
        >
          Detayları Gör
        </button>
      </section>

      <section className="rounded-xl border border-[#edf0f5] bg-white p-4">
        <h3 className="text-sm font-black text-[#083228]">Ödeme Bilgisi</h3>
        <p className="mt-2 text-xs leading-5 text-[#64748b]">
          Ödeme ProfUsta güvencesindedir.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg p-3 text-xs text-[color:var(--msg-accent)]" style={{ backgroundColor: "var(--msg-accent-light)" }}>
          <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {role === "customer"
              ? `Teklif tutarı: ${formatCurrency(conversation.latestOffer?.price ?? conversation.listing?.price)}`
              : "Hizmet bedeli iş tamamlandıktan sonra hesabınıza aktarılır."}
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-[#edf0f5] bg-white p-4">
        <h3 className="text-sm font-black text-[#083228]">
          {role === "customer" ? "Usta Bilgisi" : "Müşteri Bilgisi"}
        </h3>
        <div className="mt-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f6fb] text-sm font-black text-[#083228]">
            {initials(conversation.otherName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#083228]">
              {conversation.otherName}
            </p>
            <p className="truncate text-xs text-[#64748b]">
              {role === "customer" ? "Usta görüşmesi" : "Müşteri görüşmesi"}
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#64748b]">
          <FileText className="h-4 w-4" />
          {conversation.listing?.title ?? "Genel görüşme"}
        </div>
      </section>
    </div>
  );
}
