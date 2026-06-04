/** Logo URL — NEXT_PUBLIC_LOGO_VERSION değişince tarayıcı ve CDN önbelleği kırılır. */
export function getLogoSrc(): string {
  const version = process.env.NEXT_PUBLIC_LOGO_VERSION?.trim();
  if (!version) return "/logo.png";
  return `/logo.png?v=${encodeURIComponent(version)}`;
}
