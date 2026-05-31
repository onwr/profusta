import type { NotificationType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { sendTemplatedEmail } from "@/lib/email/send";

type NotifyInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  email?: string | null;
  emailTemplate?: "offer" | "message" | "order";
  emailVars?: Record<string, string>;
};

export async function notifyUser(input: NotifyInput) {
  await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });

  if (input.email && input.emailTemplate && input.emailVars) {
    await sendTemplatedEmail({
      to: input.email,
      template: input.emailTemplate,
      vars: input.emailVars,
    });
  }
}

export async function notifyOfferReceived(params: {
  customerId: string;
  customerEmail: string;
  providerName: string;
  requestTitle: string;
  price: number;
  link: string;
}) {
  await notifyUser({
    userId: params.customerId,
    type: "OFFER",
    title: "Yeni teklif",
    body: `${params.providerName} talebinize ${params.price.toLocaleString("tr-TR")} ₺ teklif verdi.`,
    link: params.link,
    email: params.customerEmail,
    emailTemplate: "offer",
    emailVars: {
      providerName: params.providerName,
      requestTitle: params.requestTitle,
      price: params.price.toLocaleString("tr-TR"),
      link: params.link,
    },
  });
}

export async function notifyMessageReceived(params: {
  recipientId: string;
  recipientEmail: string;
  senderName: string;
  preview: string;
  link: string;
}) {
  await notifyUser({
    userId: params.recipientId,
    type: "MESSAGE",
    title: "Yeni mesaj",
    body: `${params.senderName}: ${params.preview.slice(0, 120)}`,
    link: params.link,
    email: params.recipientEmail,
    emailTemplate: "message",
    emailVars: {
      senderName: params.senderName,
      preview: params.preview.slice(0, 200),
      link: params.link,
    },
  });
}

export async function notifyOrderUpdate(params: {
  userId: string;
  email: string;
  title: string;
  body: string;
  link: string;
  orderTitle: string;
}) {
  await notifyUser({
    userId: params.userId,
    type: "ORDER",
    title: params.title,
    body: params.body,
    link: params.link,
    email: params.email,
    emailTemplate: "order",
    emailVars: {
      title: params.title,
      body: params.body,
      orderTitle: params.orderTitle,
      link: params.link,
    },
  });
}
