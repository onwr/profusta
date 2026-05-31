const PHONE_PATTERN =
  /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{2,4}|\b0\d{3}[\s.-]?\d{3}[\s.-]?\d{2,4}\b/;

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

const WHATSAPP_PATTERN =
  /\b(whatsapp|wp|w\.?a\.?p|wa\.me|whats\s*app)\b/i;

const SOCIAL_PATTERN =
  /\b(instagram|insta|ig|facebook|fb|twitter|x\.com|tiktok|telegram|t\.me|snapchat)\b|@[a-zA-Z0-9_.]{3,}/i;

const EXTERNAL_PAYMENT_PATTERN =
  /\b(havale|eft|iban|papara|payfix|kripto|bitcoin|nakit\s*öde|dışarıdan\s*öde|platform\s*dışı)\b/i;

export function validateMessageBody(text: string): {
  ok: boolean;
  reason?: string;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "Mesaj boş olamaz" };
  }

  if (PHONE_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "Telefon numarası paylaşımı platform kurallarına aykırıdır",
    };
  }

  if (EMAIL_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "E-posta paylaşımı platform kurallarına aykırıdır",
    };
  }

  if (WHATSAPP_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "WhatsApp veya dış iletişim yönlendirmesi yasaktır",
    };
  }

  if (SOCIAL_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "Sosyal medya hesabı paylaşımı yasaktır",
    };
  }

  if (EXTERNAL_PAYMENT_PATTERN.test(trimmed)) {
    return {
      ok: false,
      reason: "Platform dışı ödeme yönlendirmesi yasaktır",
    };
  }

  return { ok: true };
}
