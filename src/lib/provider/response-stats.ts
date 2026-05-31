export type ConversationForResponse = {
  customerId: string;
  messages: { senderId: string; createdAt: Date }[];
};

type PeriodFilter = {
  since?: Date;
  until?: Date;
};

function isInPeriod(date: Date, period?: PeriodFilter) {
  if (!period) return true;
  if (period.since && date < period.since) return false;
  if (period.until && date > period.until) return false;
  return true;
}

/** Müşteri mesajına ustanın ilk yanıt süresinin ortalaması (dakika). */
export function getProviderMessageResponseStats(
  conversations: ConversationForResponse[],
  providerUserId: string,
  period?: PeriodFilter,
) {
  const responseMinutes: number[] = [];

  for (const conversation of conversations) {
    const firstCustomerMessage = conversation.messages.find(
      (message) => message.senderId === conversation.customerId,
    );
    if (!firstCustomerMessage) continue;
    if (!isInPeriod(firstCustomerMessage.createdAt, period)) continue;

    const firstProviderReply = conversation.messages.find(
      (message) =>
        message.senderId === providerUserId &&
        message.createdAt > firstCustomerMessage.createdAt,
    );
    if (!firstProviderReply) continue;

    responseMinutes.push(
      Math.max(
        1,
        Math.round(
          (firstProviderReply.createdAt.getTime() -
            firstCustomerMessage.createdAt.getTime()) /
            60000,
        ),
      ),
    );
  }

  const averageMinutes =
    responseMinutes.length > 0
      ? Math.round(
          responseMinutes.reduce((total, minutes) => total + minutes, 0) /
            responseMinutes.length,
        )
      : null;

  return { averageMinutes, sampleCount: responseMinutes.length };
}

/** Teklif gönderme süresi — eşleşmeden teklife kadar geçen süre (dakika). */
export function getProviderOfferResponseMinutes(
  offers: { createdAt: Date; requestId: string }[],
  matchByRequest: Map<string, Date>,
) {
  const diffs: number[] = [];

  for (const offer of offers) {
    const matchAt = matchByRequest.get(offer.requestId);
    if (!matchAt) continue;

    const minutes = (offer.createdAt.getTime() - matchAt.getTime()) / 60000;
    // Negatif veya 24 saati aşan kayıtlar tutarsız veri sayılır, ortalamayı bozar.
    if (minutes < 0 || minutes > 24 * 60) continue;

    diffs.push(Math.max(1, Math.round(minutes)));
  }

  if (diffs.length === 0) return null;

  diffs.sort((a, b) => a - b);
  const mid = Math.floor(diffs.length / 2);
  return diffs.length % 2 === 0
    ? Math.round((diffs[mid - 1]! + diffs[mid]!) / 2)
    : diffs[mid]!;
}
