import { Check, CheckCheck } from "lucide-react";
import { getReadStatusLabel } from "@/lib/messages/read-status";
import { cn } from "@/lib/utils";

type Props = {
  readAt: string | null | undefined;
  variant?: "bubble" | "list";
};

export function MessageReadBadge({ readAt, variant = "bubble" }: Props) {
  const { label, isRead } = getReadStatusLabel(readAt);

  if (variant === "list") {
    return (
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold",
          isRead ? "text-[#087a61]" : "text-[#7b8b87]",
        )}
      >
        {isRead ? "Okundu" : "İletildi"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "mt-1 flex items-center justify-end gap-1 text-[10px] font-medium",
        isRead ? "text-white/85" : "text-white/65",
      )}
    >
      {isRead ? (
        <CheckCheck className="h-3.5 w-3.5" aria-hidden />
      ) : (
        <Check className="h-3.5 w-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}
