import { db } from "@/lib/db";
import { serializeDisputeWithEvents } from "@/lib/orders/disputes";

export async function getOrderDetailExtras(orderId: string) {
  const [disputes, orderSource] = await Promise.all([
    db.dispute.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
      include: { events: { orderBy: { createdAt: "asc" } } },
    }),
    db.order.findUnique({
      where: { id: orderId },
      select: {
        sourceType: true,
        privateOffer: {
          select: {
            title: true,
            price: true,
            description: true,
            scheduledAt: true,
            durationHours: true,
            warrantyNote: true,
            status: true,
          },
        },
        listing: { select: { title: true } },
        requestOffer: {
          select: {
            request: { select: { category: { select: { name: true } } } },
          },
        },
      },
    }),
  ]);

  return {
    disputes: disputes.map(serializeDisputeWithEvents),
    sourceType: orderSource?.sourceType,
    privateOffer: orderSource?.privateOffer ?? null,
    listingTitle: orderSource?.listing?.title ?? null,
    requestCategory:
      orderSource?.requestOffer?.request.category.name ?? null,
  };
}
