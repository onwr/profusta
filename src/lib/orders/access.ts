import type { User } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function getOrderForUser(
  orderId: string,
  user: Pick<User, "id" | "role"> & { provider?: { id: string } | null },
) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      customer: { select: { id: true, fullName: true, email: true, phone: true } },
      provider: {
        include: { user: { select: { id: true, fullName: true, email: true } } },
      },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) return null;

  const isCustomer = order.customerId === user.id;
  const isProvider =
    user.role === "PROVIDER" && order.providerId === user.provider?.id;

  if (!isCustomer && !isProvider && user.role !== "ADMIN") return null;

  return { order, isCustomer, isProvider };
}
