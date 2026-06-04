/** Geçersiz .env URL değerlerinde uygulamanın çökmesini önler. */
export function safeAppUrl(fallback = "http://localhost:3000"): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!raw) return fallback;

  try {
    return new URL(raw).origin;
  } catch {
    return fallback;
  }
}

export function safeCdnHostname(fallback = "cdn.littlemomstore.com"): string {
  const raw = process.env.CDN_BASE_URL?.trim();
  if (!raw) return fallback;

  try {
    return new URL(raw).hostname;
  } catch {
    return fallback;
  }
}
