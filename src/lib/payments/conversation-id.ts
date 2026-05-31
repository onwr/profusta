/** İyzico conversationId — deneme başına benzersiz (max 128 karakter). */
export function generateConversationId(): string {
  return `PRF${Date.now()}${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}
