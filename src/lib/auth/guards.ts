import { getCurrentUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/api";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return { user: null, error: jsonError("Yetkisiz erişim", 403) };
  }
  return { user, error: null };
}

export async function requireSession() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: jsonError("Oturum gerekli", 401) };
  }
  return { user, error: null };
}

export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: jsonError("Oturum gerekli", 401) };
  }
  if (user.role !== "CUSTOMER") {
    return { user: null, error: jsonError("Bu işlem için müşteri hesabı gerekli", 403) };
  }
  return { user, error: null };
}

export async function requireProvider() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: jsonError("Oturum gerekli", 401) };
  }
  if (user.role !== "PROVIDER") {
    return { user: null, error: jsonError("Bu işlem için usta hesabı gerekli", 403) };
  }
  if (user.provider?.status !== "APPROVED") {
    return { user: null, error: jsonError("Usta hesabınız henüz onaylanmadı", 403) };
  }
  return { user, error: null };
}
