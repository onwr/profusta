export type CategoryWithCover = {
  slug: string;
  name: string;
  coverImageUrl: string | null;
  icon?: string | null;
};

/** /hizmetler/elektrik veya /hizmetler/elektrik?x=1 → elektrik */
export function categorySlugFromHref(href: string | null | undefined): string | null {
  if (!href) return null;
  try {
    const path = href.startsWith("http")
      ? new URL(href).pathname
      : href.split("?")[0];
    const match = path.match(/^\/hizmetler\/([^/]+)\/?$/);
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}
