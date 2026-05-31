"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
};

export function InviteFriendModal({ open, onClose, userId }: Props) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    const url = new URL(ROUTES.register, window.location.origin);
    url.searchParams.set("ref", userId);
    setInviteUrl(url.toString());
  }, [open, userId]);

  const copyLink = useCallback(async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Davet linkini kopyalayın:", inviteUrl);
    }
  }, [inviteUrl]);

  async function shareLink() {
    if (!inviteUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "ProfUsta daveti",
          text: "ProfUsta üzerinden güvenilir usta bul — bu linkle kayıt ol:",
          url: inviteUrl,
        });
        return;
      } catch {
        /* kullanıcı iptal etti */
      }
    }
    await copyLink();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Arkadaşını davet et"
      description="Linki paylaşın; arkadaşınız kayıt olduğunda kampanya koşulları geçerli olur."
      size="md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Kapat
          </Button>
          <Button type="button" onClick={shareLink}>
            <Share2 className="h-4 w-4" />
            Paylaş
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[#53635f]">
          Davet linkiniz kişiseldir. Arkadaşınız bu adresle kayıt olabilir.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={inviteUrl}
            className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#fafaf8] px-3 py-2.5 text-sm text-[#083228]"
          />
          <Button type="button" variant="outline" onClick={copyLink}>
            {copied ? (
              <Check className="h-4 w-4 text-[#087a61]" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        {copied ? (
          <p className="text-xs font-semibold text-[#087a61]">Link kopyalandı</p>
        ) : null}
      </div>
    </Modal>
  );
}
