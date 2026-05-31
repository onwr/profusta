import { OrderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getProviderRating } from "@/lib/reviews/aggregate";

const COMPLETED_ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.COMPLETED,
  OrderStatus.PAYOUT_PENDING,
  OrderStatus.PAYOUT_COMPLETED,
];

export async function getProviderConversationStats(providerId: string) {
  const [rating, completedOrderCount, provider] = await Promise.all([
    getProviderRating(providerId),
    db.order.count({
      where: {
        providerId,
        status: { in: COMPLETED_ORDER_STATUSES },
      },
    }),
    db.provider.findUnique({
      where: { id: providerId },
      select: { baseCity: true, baseDistrict: true },
    }),
  ]);

  return {
    ratingAvg: rating.ratingAvg,
    reviewCount: rating.reviewCount,
    completedOrderCount,
    baseCity: provider?.baseCity ?? null,
    baseDistrict: provider?.baseDistrict ?? null,
  };
}

export { formatProviderConversationSubtitle } from "@/lib/providers/conversation-stats-format";
