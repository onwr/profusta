export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getReadStatusLabel(readAt: string | null | undefined): {
  label: string;
  isRead: boolean;
} {
  if (readAt) {
    return {
      label: `Okundu · ${formatMessageTime(readAt)}`,
      isRead: true,
    };
  }
  return { label: "İletildi", isRead: false };
}
