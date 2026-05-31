"use client";

import { useState } from "react";
import { HandCoins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrivateOfferModal } from "@/components/messages/private-offer-modal";

export function PrivateOfferForm({
  conversationId,
  onSent,
  compact = false,
}: {
  conversationId: string;
  onSent: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={
          compact
            ? "h-8 gap-2 rounded-lg border-[#edf0f5] px-3 text-xs font-semibold text-[#64748b]"
            : "h-10 gap-2 px-4 text-sm"
        }
        onClick={() => setOpen(true)}
      >
        <HandCoins className={compact ? "h-3.5 w-3.5" : "h-4 w-4 text-[#087a61]"} />
        {compact ? "Özel Teklif Oluştur" : "Özel teklif gönder"}
      </Button>

      <PrivateOfferModal
        open={open}
        onClose={() => setOpen(false)}
        conversationId={conversationId}
        onSent={() => {
          setOpen(false);
          onSent();
        }}
      />
    </>
  );
}
