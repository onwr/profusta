import { z } from "zod";

/** Türkiye IBAN: TR + 24 rakam (toplam 26 karakter, boşluksuz) */
export const TURKISH_IBAN_REGEX = /^TR\d{24}$/;

export const TURKISH_IBAN_FORMAT_HINT = "TR00 0000 0000 0000 0000 0000 00";

export function normalizeIban(value: string): string {
  return value.replace(/\s/g, "").toUpperCase();
}

/** Görüntüleme: 4’lü gruplar */
export function formatIbanDisplay(value: string): string {
  const clean = normalizeIban(value);
  if (!clean) return "";
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

export function maskIban(iban: string): string {
  const clean = normalizeIban(iban);
  if (clean.length <= 8) return clean;
  return `${clean.slice(0, 4)} •••• •••• ${clean.slice(-4)}`;
}

/** Kullanıcı girişini TR IBAN formatına sınırlar */
export function sanitizeIbanInput(raw: string): string {
  let clean = raw.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  if (clean.length === 0) return "";

  if (!clean.startsWith("TR")) {
    if (clean.startsWith("T")) {
      clean = `TR${clean.slice(1).replace(/^R?/, "")}`;
    } else {
      clean = `TR${clean}`;
    }
  }

  clean = clean.slice(0, 26);
  return formatIbanDisplay(clean);
}

export function isValidTurkishIban(value: string): boolean {
  const iban = normalizeIban(value);
  if (!iban) return true;
  if (!TURKISH_IBAN_REGEX.test(iban)) return false;
  return validateIbanMod97(iban);
}

function validateIbanMod97(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) =>
    String(ch.charCodeAt(0) - 55),
  );

  let remainder = numeric;
  while (remainder.length > 2) {
    const block = remainder.slice(0, 9);
    remainder = String(parseInt(block, 10) % 97) + remainder.slice(block.length);
  }

  return parseInt(remainder, 10) % 97 === 1;
}

export const optionalTurkishIbanSchema = z
  .string()
  .optional()
  .transform((val) => {
    const normalized = normalizeIban(val ?? "");
    return normalized.length > 0 ? normalized : undefined;
  })
  .refine((val) => val === undefined || isValidTurkishIban(val), {
    message:
      "Geçerli bir Türkiye IBAN girin (TR ile başlayan 26 karakter, örn. TR33 0006 1005 1978 6457 8413 26)",
  });
