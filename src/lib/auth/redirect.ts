import type { SessionPayload } from "@/lib/auth/jwt";

export function getRedirectForRole(
  role: SessionPayload["role"],
  providerStatus?: string | null,
): string {
  if (role === "ADMIN") return "/admin";
  if (role === "PROVIDER") {
    if (providerStatus === "APPROVED") return "/usta";
    return "/usta-basvuru/beklemede";
  }
  return "/musteri";
}
