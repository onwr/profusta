/** ProfUSTA panel (usta + müşteri) tasarım token'ları */
export const panelTheme = {
  primary: "#087a61",
  primaryDark: "#066b54",
  primaryMid: "#0a6b58",
  dark: "#083228",
  mint: "#eef8f5",
  surface: "#f8fcfa",
  muted: "#5a7a72",
  mutedLight: "#8aa39c",
  success: "#087a61",
  warning: "#ca8a04",
  danger: "#ef4444",
} as const;

export const panelClasses = {
  pageBg: "bg-[#f8fcfa]",
  card: "rounded-[20px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]",
  cardLg: "rounded-[28px] border border-black/5 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]",
  pageTitle: "text-[28px] font-black leading-tight text-[#083228]",
  sectionTitle: "text-[15px] font-black text-[#083228]",
  cardTitle: "text-[17px] font-black tracking-[-0.02em] text-[#083228]",
  subtitle: "text-[12px] font-medium text-[#5a7a72]",
  primaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#087a61] px-4 text-sm font-bold text-white shadow-[0_8px_20px_rgba(8,122,97,0.22)] transition hover:brightness-95 disabled:opacity-50",
  secondaryBtn:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-bold text-[#5a7a72] transition hover:border-[#087a61]/25 hover:bg-[#eef8f5] hover:text-[#083228]",
  ghostBtn:
    "inline-flex items-center justify-center gap-1.5 rounded-xl border border-black/8 bg-white px-3 text-[12px] font-black text-[#087a61] transition hover:border-[#087a61]/25 hover:bg-[#eef8f5]",
  backLink:
    "inline-flex items-center gap-2 text-sm font-bold text-[#087a61] transition hover:underline",
  input:
    "w-full rounded-xl border border-black/10 bg-[#f8fcfa] px-4 text-sm text-[#083228] outline-none transition focus:border-[#087a61] focus:ring-2 focus:ring-[#087a61]/20",
  emptyState:
    "rounded-[22px] border border-dashed border-[#087a61]/20 bg-[#eef8f5]/60 px-6 py-8 text-center",
  pillActive: "bg-[#087a61] text-white shadow-sm",
  pillInactive:
    "bg-[#f8fcfa] text-[#5a7a72] hover:bg-[#eef8f5] hover:text-[#087a61]",
  iconBox: "grid place-items-center rounded-xl bg-[#eef8f5] text-[#087a61]",
  listItem:
    "rounded-[16px] border border-black/5 bg-[#f8fcfa] transition hover:border-[#087a61]/20 hover:bg-white",
  listItemMint:
    "rounded-[16px] border border-black/5 bg-[#f8fcfa] transition hover:border-[#087a61]/20 hover:bg-white",
  spinner: "text-[#087a61]",
} as const;

/** Usta paneli geriye uyumluluk */
export const providerTheme = panelTheme;
export const providerClasses = panelClasses;

/** @deprecated panelTheme kullanın */
export const providerPanel = {
  ...panelTheme,
  navy: panelTheme.dark,
  navyDark: "#041b15",
  navyMid: "#064a3f",
  accent: panelTheme.primary,
  accentBright: panelTheme.primaryMid,
  bg: panelTheme.surface,
  cardBorder: "border-black/5",
  cardShadow: "shadow-[0_18px_50px_rgba(8,50,40,0.06)]",
  text: panelTheme.dark,
  muted: panelTheme.muted,
} as const;
