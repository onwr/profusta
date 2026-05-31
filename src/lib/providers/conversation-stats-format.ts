/** Client-safe — yalnızca formatlama, DB import yok. */

export function formatProviderConversationSubtitle(stats: {
  ratingAvg: number | null;
  reviewCount: number;
  completedOrderCount: number;
  baseCity: string | null;
  baseDistrict: string | null;
}) {
  const parts: string[] = [];

  if (stats.ratingAvg != null && stats.reviewCount > 0) {
    parts.push(`${stats.ratingAvg} (${stats.reviewCount})`);
  }

  if (stats.baseCity) {
    parts.push(
      stats.baseDistrict
        ? `${stats.baseCity}, ${stats.baseDistrict}`
        : stats.baseCity,
    );
  }

  if (stats.completedOrderCount > 0) {
    parts.push(`${stats.completedOrderCount} tamamlanan iş`);
  }

  return parts.length > 0 ? parts.join("  •  ") : "Onaylı usta";
}
