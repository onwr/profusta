import { cn } from "@/lib/utils";

const variants: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-800",
  PENDING: "bg-amber-100 text-amber-800",
  PAID_ESCROW: "bg-[#087a61]/15 text-[#087a61]",
  PROVIDER_ACCEPTED: "bg-[#087a61]/15 text-[#087a61]",
  IN_PROGRESS: "bg-[#e6f4f0] text-[#0a6b58]",
  COMPLETED_BY_PROVIDER: "bg-[#fef9c3] text-[#ca8a04]",
  default: "bg-[#eef8f5] text-[#5a7a72]",
};

const labels: Record<string, string> = {
  OPEN: "Teklif bekliyor",
  PENDING: "Beklemede",
  PAID_ESCROW: "Onaylandı",
  PROVIDER_ACCEPTED: "Onaylandı",
  IN_PROGRESS: "Devam ediyor",
  COMPLETED_BY_PROVIDER: "Onay bekliyor",
};

export function DashboardStatusBadge({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold",
        variants[status] ?? variants.default,
      )}
    >
      {label ?? labels[status] ?? status}
    </span>
  );
}
