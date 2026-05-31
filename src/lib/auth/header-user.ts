import type { UserRole } from "@/generated/prisma/client";
import { ROUTES } from "@/lib/constants";

export type HeaderUser = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  providerStatus: string | null;
};

export function getHeaderPanelHref(user: HeaderUser): string {
  if (user.role === "ADMIN") return ROUTES.admin.dashboard;
  if (user.role === "PROVIDER") {
    if (user.providerStatus === "APPROVED") return ROUTES.provider.dashboard;
    return "/usta-basvuru/beklemede";
  }
  return ROUTES.customer.dashboard;
}

export function getHeaderMessagesHref(user: HeaderUser): string | null {
  if (user.role === "PROVIDER" && user.providerStatus === "APPROVED") {
    return ROUTES.provider.messages;
  }
  if (user.role === "CUSTOMER") return ROUTES.customer.messages;
  return null;
}

export function getHeaderPanelLabel(user: HeaderUser): string {
  if (user.role === "ADMIN") return "Admin";
  if (user.role === "PROVIDER") {
    return user.providerStatus === "APPROVED" ? "Usta Paneli" : "Başvurum";
  }
  return "Panelim";
}

export function userInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
