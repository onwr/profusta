"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";

export function ProviderShareButton({
  title,
}: {
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function shareProfile() {
    const url = window.location.href;
    const text = `${title} ProfUSTA profilini inceleyin.`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Kullanıcı paylaşım penceresini kapatırsa sessiz kal.
    }
  }

  return (
    <button
      type="button"
      onClick={shareProfile}
      className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-black/5 bg-white text-xs font-black text-[#53635f] transition hover:bg-[#f8fafc] hover:text-[#083228]"
    >
      <Share2 className="h-4 w-4" />
      {copied ? "Link Kopyalandı" : "Profili Paylaş"}
    </button>
  );
}
