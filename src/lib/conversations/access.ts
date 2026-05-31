import type { User } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export async function getConversationForUser(
  conversationId: string,
  user: Pick<User, "id" | "role"> & { provider?: { id: string } | null },
) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      customer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
      provider: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
        },
      },
      listing: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          city: true,
          district: true,
          createdAt: true,
        },
      },
      privateOffers: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          status: true,
          price: true,
          title: true,
          createdAt: true,
          scheduledAt: true,
        },
      },
    },
  });

  if (!conversation) return null;

  const isCustomer = conversation.customerId === user.id;
  const isProvider =
    user.role === "PROVIDER" && conversation.providerId === user.provider?.id;

  if (!isCustomer && !isProvider) return null;

  return { conversation, isCustomer, isProvider };
}

export function getOtherPartyName(
  conversation: {
    customer: { fullName: string };
    provider: { user: { fullName: string } };
  },
  isCustomer: boolean,
) {
  return isCustomer
    ? conversation.provider.user.fullName
    : conversation.customer.fullName;
}
