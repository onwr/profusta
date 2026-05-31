/** Client-safe — Prisma/db import etmez. */

const MESSAGES: Record<string, string> = {
  google_auth_failed: "Google ile giriş tamamlanamadı. Tekrar deneyin.",
  google_state_invalid: "Oturum süresi doldu. Lütfen tekrar deneyin.",
  google_config:
    "Google girişi yapılandırılmamış. Admin → Google Giriş Ayarlarından Client ID ve Secret girin.",
  google_need_register:
    "Bu Google hesabıyla kayıtlı kullanıcı yok. Lütfen kayıt olun.",
  google_account_inactive: "Hesabınız devre dışı bırakılmıştır.",
  google_provider_suspended:
    "Hesabınız askıya alınmıştır. Destek ile iletişime geçin.",
};

export function getGoogleAuthErrorMessage(code: string | null): string | null {
  if (!code) return null;
  return MESSAGES[code] ?? MESSAGES.google_auth_failed;
}
