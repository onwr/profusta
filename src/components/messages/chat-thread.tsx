"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  MapPin,
  Paperclip,
  Send,
  Smile,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClassName } from "@/components/auth/form-field";
import { MessageReadBadge } from "@/components/messages/message-read-badge";
import { PrivateOfferCard } from "@/components/messages/private-offer-card";
import { PrivateOfferForm } from "@/components/messages/private-offer-form";
import { formatMessageTime } from "@/lib/messages/read-status";

const quickEmojis = ["👍", "🙏", "😊", "✅", "👏", "🙂", "👌", "❤️"];

type Message = {
  id: string;
  senderId: string;
  type: string;
  body: string | null;
  readAt: string | null;
  createdAt: string;
  privateOffer: {
    id: string;
    price: number;
    description: string;
    scheduledAt: string | null;
    durationHours: number | null;
    warrantyNote: string | null;
    status: string;
  } | null;
};

type Props = {
  conversationId: string;
  currentUserId: string;
  isCustomer: boolean;
  otherName: string;
  variant?: "page" | "messageCenter";
};

async function markConversationRead(conversationId: string) {
  await fetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" });
}

export function ChatThread({
  conversationId,
  currentUserId,
  isCustomer,
  otherName,
  variant = "page",
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMessages = useCallback(async () => {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    const data = await res.json();
    if (!res.ok) return;

    setMessages(data.messages ?? []);
    setLoading(false);
    await markConversationRead(conversationId);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca konuşma değişince
  }, [conversationId]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function onImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Sadece JPEG, PNG veya WebP yükleyebilirsiniz");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Görsel en fazla 5MB olabilir");
      return;
    }
    setError("");
    setImageFile(file);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function clearImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const text = body.trim();
    if (!text && !imageFile) {
      setError("Mesaj veya görsel girin");
      return;
    }

    setSending(true);
    try {
      let res: Response;

      if (imageFile) {
        const form = new FormData();
        form.append("image", imageFile);
        res = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          body: form,
        });
      } else {
        res = await fetch(`/api/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: text }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gönderilemedi");
        return;
      }

      setBody("");
      clearImage();
      if (data.message) {
        setMessages((prev) => [...prev, data.message as Message]);
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  }

  async function sendTextMessage(text: string) {
    setError("");
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gönderilemedi");
        return;
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message as Message]);
      }
    } catch {
      setError("Bağlantı hatası");
    } finally {
      setSending(false);
    }
  }

  function sendLocation() {
    if (!navigator.geolocation) {
      setError("Tarayıcınız konum paylaşımını desteklemiyor");
      return;
    }

    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        void sendTextMessage(
          `Konumum: https://www.google.com/maps?q=${latitude},${longitude}`,
        );
      },
      () => setError("Konum izni alınamadı"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  function addEmoji(emoji: string) {
    setBody((current) => `${current}${emoji}`);
    setEmojiOpen(false);
  }

  function renderMessageContent(m: Message, isMine: boolean) {
    if (m.type === "PRIVATE_OFFER" && m.privateOffer) {
      return (
        <div className="max-w-[85%]">
          <PrivateOfferCard
            offer={m.privateOffer}
            isCustomer={isCustomer}
            conversationId={conversationId}
            onUpdate={() => loadMessages()}
          />
          {isMine ? (
            <div className="mt-1 flex justify-end">
              <MessageReadBadge readAt={m.readAt} variant="list" />
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-[#7b8b87]">
              {formatMessageTime(m.createdAt)}
            </p>
          )}
        </div>
      );
    }

    if (m.type === "IMAGE" && m.body) {
      return (
        <div className="max-w-[min(280px,80vw)]">
          <a
            href={m.body}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl ring-1 ring-black/10"
          >
            <Image
              src={m.body}
              alt="Gönderilen görsel"
              width={280}
              height={280}
              className="h-auto max-h-72 w-full object-cover"
              unoptimized
            />
          </a>
          {isMine ? (
            <div className="mt-1 flex justify-end">
              <MessageReadBadge readAt={m.readAt} variant="list" />
            </div>
          ) : (
            <p className="mt-1 text-[10px] text-[#7b8b87]">
              {formatMessageTime(m.createdAt)}
            </p>
          )}
        </div>
      );
    }

    const mineClass =
      variant === "messageCenter"
        ? "bg-[#d9fbe7] text-[#0f3f31] ring-1 ring-[#b9f0ce]"
        : "bg-[#087a61] text-white";
    const otherClass =
      variant === "messageCenter"
        ? "bg-white text-[#243041] ring-1 ring-black/5 shadow-sm"
        : "bg-[#f4f7f6] text-[#083228]";

    return (
      <div className="max-w-[80%]">
        <div
          className={[
            "rounded-2xl px-4 py-3 text-sm leading-6",
            isMine ? mineClass : otherClass,
          ].join(" ")}
        >
          {m.body}
          {isMine ? (
            <MessageReadBadge readAt={m.readAt} />
          ) : (
            <p className="mt-1 text-[10px] text-[#7b8b87]">
              {formatMessageTime(m.createdAt)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "messageCenter"
          ? "flex h-full min-h-[520px] flex-col bg-[#fbfaf7]"
          : "flex h-[calc(100vh-12rem)] min-h-[400px] flex-col rounded-2xl border border-black/5 bg-white"
      }
    >
      {variant === "page" ? (
        <div className="border-b border-black/5 px-6 py-4">
          <h2 className="font-bold text-[#083228]">{otherName}</h2>
        </div>
      ) : null}

      <div
        className={
          variant === "messageCenter"
            ? "flex-1 space-y-4 overflow-y-auto px-5 py-5"
            : "flex-1 space-y-4 overflow-y-auto px-6 py-4"
        }
      >
        {loading ? (
          <p className="text-sm text-[#53635f]">Yükleniyor...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-[#53635f]">
            Henüz mesaj yok. İlk mesajı gönderin.
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.senderId === currentUserId;
            return (
              <div
                key={m.id}
                className={isMine ? "flex justify-end" : "flex justify-start"}
              >
                {renderMessageContent(m, isMine)}
              </div>
            );
          })
        )}
      </div>

      <div
        className={
          variant === "messageCenter"
            ? "border-t border-[#edf0f5] bg-white px-4 py-3"
            : "border-t border-black/5 px-6 py-4"
        }
      >
        {!isCustomer && variant === "page" ? (
          <div className="mb-3">
            <PrivateOfferForm
              conversationId={conversationId}
              onSent={() => loadMessages()}
            />
          </div>
        ) : null}

        {imagePreview ? (
          <div className="relative mb-3 inline-block">
            <Image
              src={imagePreview}
              alt="Önizleme"
              width={120}
              height={120}
              className="h-24 w-24 rounded-xl object-cover ring-1 ring-black/10"
              unoptimized
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#083228] text-white"
              aria-label="Görseli kaldır"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="mb-2 text-sm text-red-600">{error}</p>
        ) : null}

        <form
          onSubmit={sendMessage}
          className={
            variant === "messageCenter"
              ? "flex items-center gap-2"
              : "flex gap-2"
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={onImageSelect}
          />
          {variant === "page" ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-black/10 text-[#087a61] hover:bg-[#eef8f5]"
              aria-label="Görsel ekle"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
          ) : null}
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className={
              variant === "messageCenter"
                ? "h-10 min-w-0 flex-1 rounded-lg border border-[#edf0f5] bg-white px-3 text-sm outline-none transition focus:border-[#0b8f6f]/30 focus:ring-2 focus:ring-[#0b8f6f]/10"
                : inputClassName
            }
            disabled={!!imageFile}
          />
          {variant === "messageCenter" ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setEmojiOpen((value) => !value)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[#8b98aa] hover:bg-[#f8fafc]"
                  aria-label="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                {emojiOpen ? (
                  <div className="absolute bottom-full right-0 z-20 mb-2 grid grid-cols-4 gap-1 rounded-xl border border-[#edf0f5] bg-white p-2 shadow-lg">
                    {quickEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => addEmoji(emoji)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-base hover:bg-[#f8fafc]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={sending || (!body.trim() && !imageFile)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0b8f6f] text-white transition hover:bg-[#087a61] disabled:opacity-50"
                aria-label="Gönder"
              >
                <Send className="h-4 w-4" />
              </button>
            </>
          ) : (
            <Button
              type="submit"
              disabled={sending || (!body.trim() && !imageFile)}
              className="h-11 shrink-0 px-6"
            >
              {sending ? "..." : "Gönder"}
            </Button>
          )}
        </form>
        {variant === "messageCenter" ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#edf0f5] px-3 text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc]"
            >
              <Paperclip className="h-3.5 w-3.5" />
              Dosya Ekle
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#edf0f5] px-3 text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc]"
            >
              <Camera className="h-3.5 w-3.5" />
              Fotoğraf Gönder
            </button>
            <button
              type="button"
              onClick={sendLocation}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-[#edf0f5] px-3 text-xs font-semibold text-[#64748b] hover:bg-[#f8fafc]"
            >
              <MapPin className="h-3.5 w-3.5" />
              Konum Gönder
            </button>
            {!isCustomer ? (
              <PrivateOfferForm
                conversationId={conversationId}
                onSent={loadMessages}
                compact
              />
            ) : null}
          </div>
        ) : null}
        {imageFile ? (
          <p className="mt-2 text-xs text-[#7b8b87]">
            Görsel gönderilecek. Metin için önce görseli kaldırın veya doğrudan
            gönderin.
          </p>
        ) : null}
      </div>
    </div>
  );
}
