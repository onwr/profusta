export const LISTING_STATUS_LABELS: Record<string, string> = {
  PENDING: "Onay bekliyor",
  ACTIVE: "Yayında",
  REJECTED: "Reddedildi",
  INACTIVE: "Pasif",
};

export const LISTING_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  ACTIVE: "bg-[#dcf7e7] text-[#10b981]",
  REJECTED: "bg-red-50 text-red-600",
  INACTIVE: "bg-slate-100 text-slate-600",
};

export type ListingFilterKey =
  | "all"
  | "PENDING"
  | "ACTIVE"
  | "REJECTED"
  | "INACTIVE";
