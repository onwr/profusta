/** Dakikayı okunabilir Türkçe süreye çevirir (ör. 90 → "2 saat", 1336 → "22 saat"). */
export function formatDurationMinutes(minutes: number): string {
  const rounded = Math.max(1, Math.round(minutes));

  if (rounded < 60) return `${rounded} dk`;

  const hours = Math.round(rounded / 60);
  if (hours < 24) return `${hours} saat`;

  const days = Math.round(hours / 24);
  return `${days} gün`;
}
