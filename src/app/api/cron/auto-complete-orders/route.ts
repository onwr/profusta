import { DisputeStatus, OrderStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { releaseToProviderBalance } from "@/lib/orders/transitions";

const HOURS_48_MS = 48 * 60 * 60 * 1000;

function verifyCronAuth(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!verifyCronAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cutoff = new Date(Date.now() - HOURS_48_MS);

  const orders = await db.order.findMany({
    where: {
      status: OrderStatus.COMPLETED_BY_PROVIDER,
      providerCompletedAt: { lte: cutoff },
      disputes: { none: { status: DisputeStatus.OPEN } },
    },
  });

  let processed = 0;
  for (const order of orders) {
    const result = await releaseToProviderBalance(order);
    if (result.ok && !result.alreadyReleased) processed++;
  }

  return Response.json({
    ok: true,
    checked: orders.length,
    autoCompleted: processed,
  });
}
