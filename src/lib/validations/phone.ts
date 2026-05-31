import { z } from "zod";

export const TURKISH_PHONE_FORMAT_HINT = "0541 196 18 30";

/** Rakamlara indirger; +90 / 90 önekini 0 ile başlayan forma çevirir */
export function normalizeTurkishPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("90") && digits.length >= 12) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.length > 0 && !digits.startsWith("0")) {
    digits = `0${digits}`;
  }

  return digits.slice(0, 11);
}

/** Görüntüleme: 0541 196 18 30 (4-3-2-2) */
export function formatTurkishPhoneDisplay(value: string): string {
  const digits = normalizeTurkishPhone(value);
  if (!digits) return "";

  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  if (digits.length <= 9) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`;
}

export function sanitizeTurkishPhoneInput(raw: string): string {
  return formatTurkishPhoneDisplay(raw);
}

/** Türkiye cep: 05XX XXX XX XX */
export function isValidTurkishPhone(value: string): boolean {
  const digits = normalizeTurkishPhone(value);
  return /^05\d{9}$/.test(digits);
}

export const turkishPhoneSchema = z
  .string()
  .min(1, "Telefon numarası gerekli")
  .transform((val) => normalizeTurkishPhone(val))
  .refine((val) => isValidTurkishPhone(val), {
    message: `Geçerli bir cep telefonu girin (örn. ${TURKISH_PHONE_FORMAT_HINT})`,
  });

export const optionalTurkishPhoneSchema = z
  .string()
  .optional()
  .transform((val) => {
    const normalized = normalizeTurkishPhone(val ?? "");
    return normalized.length > 0 ? normalized : undefined;
  })
  .refine((val) => val === undefined || isValidTurkishPhone(val), {
    message: `Geçerli bir cep telefonu girin (örn. ${TURKISH_PHONE_FORMAT_HINT})`,
  });
