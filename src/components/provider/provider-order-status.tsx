import { cn } from "@/lib/utils";

const labels: Record<string, string> = {
  PENDING_PAYMENT: "Ödeme bekliyor",
  PAID_ESCROW: "Ödeme alındı",
  PROVIDER_ACCEPTED: "Kabul edildi",
  IN_PROGRESS: "Devam ediyor",
  COMPLETED_BY_PROVIDER: "Onay bekleniyor",
  COMPLETED: "Tamamlandı",
  CANCELLED: "İptal",
  REFUNDED: "İade",
  DISPUTED: "İtiraz açık",
  PAYOUT_PENDING: "Ödeme bekliyor",
  PAYOUT_COMPLETED: "Ödendi",
};

const styles: Record<string, string> = {
  PENDING_PAYMENT: "bg-[#fef9c3] text-[#ca8a04]",
  PAID_ESCROW: "bg-[#eef8f5] text-[#087a61]",
  PROVIDER_ACCEPTED: "bg-[#e6f4f0] text-[#0a6b58]",
  IN_PROGRESS: "bg-[#eef8f5] text-[#087a61]",
  COMPLETED_BY_PROVIDER: "bg-[#fef9c3] text-[#ca8a04]",
  COMPLETED: "bg-[#dcf7e7] text-[#066b54]",
  CANCELLED: "bg-[#f0f4f2] text-[#5a7a72]",
  REFUNDED: "bg-red-50 text-red-600",
  DISPUTED: "bg-orange-50 text-orange-700",
  PAYOUT_PENDING: "bg-[#fef9c3] text-[#ca8a04]",
  PAYOUT_COMPLETED: "bg-[#dcf7e7] text-[#066b54]",
};

export function ProviderOrderStatus({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-black",
        styles[status] ?? "bg-[#f0f4f2] text-[#5a7a72]",
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
