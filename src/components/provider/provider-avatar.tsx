"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 text-sm",
  md: "h-[52px] w-[52px] text-xl",
  lg: "h-24 w-24 text-3xl",
} as const;

type Props = {
  userName: string;
  avatarUrl?: string | null;
  size?: keyof typeof SIZES;
  editable?: boolean;
  showVerifiedBadge?: boolean;
  className?: string;
  onChange?: (url: string | null) => void;
};

export function ProviderAvatar({
  userName,
  avatarUrl: initialUrl,
  size = "md",
  editable = false,
  showVerifiedBadge = false,
  className,
  onChange,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setAvatarUrl(initialUrl ?? null);
  }, [initialUrl]);

  const initial = userName.charAt(0).toUpperCase();
  const sizeClass = SIZES[size];
  const imagePx = size === "sm" ? 36 : size === "md" ? 52 : 96;

  async function upload(file: File) {
    setUploading(true);
    setError("");

    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch("/api/provider/avatar", {
      method: "POST",
      body: form,
    });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Yükleme başarısız");
      return;
    }

    const url = data.avatarUrl as string;
    setAvatarUrl(url);
    onChange?.(url);
    router.refresh();
  }

  async function remove() {
    setUploading(true);
    setError("");

    const res = await fetch("/api/provider/avatar", { method: "DELETE" });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setError(data.error ?? "Kaldırılamadı");
      return;
    }

    setAvatarUrl(null);
    onChange?.(null);
    router.refresh();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void upload(file);
  }

  const avatarNode = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-linear-to-br from-[#064a3f] to-[#087a61] font-black text-white",
        sizeClass,
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={userName}
          width={imagePx}
          height={imagePx}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="grid h-full w-full place-items-center">{initial}</span>
      )}

      {editable && !uploading ? (
        <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
          <Camera className="h-5 w-5 text-white" />
        </span>
      ) : null}

      {uploading ? (
        <span className="absolute inset-0 grid place-items-center bg-black/50">
          <Loader2 className="h-5 w-5 animate-spin text-white" />
        </span>
      ) : null}
    </div>
  );

  return (
    <div className="relative">
      {editable ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#087a61] focus-visible:ring-offset-2"
          title="Profil fotoğrafı değiştir"
        >
          {avatarNode}
        </button>
      ) : (
        avatarNode
      )}

      {showVerifiedBadge ? (
        <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full bg-[#087a61] ring-2 ring-white">
          <BadgeCheck className="h-3 w-3 text-white" />
        </span>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />

      {error ? (
        <p className="absolute left-0 top-full z-10 mt-1 max-w-[200px] text-[10px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProviderAvatarActions({
  userName,
  avatarUrl: initialUrl,
  onChange,
}: {
  userName: string;
  avatarUrl?: string | null;
  onChange?: (url: string | null) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setAvatarUrl(initialUrl ?? null);
  }, [initialUrl]);

  async function upload(file: File) {
    setUploading(true);
    setMessage("");

    const form = new FormData();
    form.append("avatar", file);

    const res = await fetch("/api/provider/avatar", {
      method: "POST",
      body: form,
    });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Yükleme başarısız");
      return;
    }

    setAvatarUrl(data.avatarUrl);
    onChange?.(data.avatarUrl);
    setMessage("Profil fotoğrafı güncellendi");
    router.refresh();
  }

  async function remove() {
    if (!avatarUrl) return;
    setUploading(true);
    setMessage("");

    const res = await fetch("/api/provider/avatar", { method: "DELETE" });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setMessage(data.error ?? "Kaldırılamadı");
      return;
    }

    setAvatarUrl(null);
    onChange?.(null);
    setMessage("Profil fotoğrafı kaldırıldı");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <ProviderAvatar
        userName={userName}
        avatarUrl={avatarUrl}
        size="lg"
        editable
        onChange={setAvatarUrl}
      />

      <div className="flex flex-col gap-2 text-center sm:text-left">
        <p className="text-sm font-bold text-[#083228]">Profil fotoğrafı</p>
        <p className="max-w-xs text-xs text-[#5a7a72]">
          JPEG, PNG veya WebP. En fazla 5 MB. Sidebar ve üst barda görünür.
        </p>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl bg-[#087a61] px-4 py-2 text-sm font-bold text-white hover:brightness-95 disabled:opacity-60"
          >
            {uploading ? "Yükleniyor…" : "Fotoğraf yükle"}
          </button>
          {avatarUrl ? (
            <button
              type="button"
              disabled={uploading}
              onClick={() => void remove()}
              className="rounded-xl border border-black/10 px-4 py-2 text-sm font-bold text-[#5a7a72] hover:bg-[#eef8f5] disabled:opacity-60"
            >
              Kaldır
            </button>
          ) : null}
        </div>
        {message ? (
          <p
            className={cn(
              "text-xs font-semibold",
              message.includes("başarısız") || message.includes("Kaldırılamadı")
                ? "text-red-600"
                : "text-[#087a61]",
            )}
          >
            {message}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
