import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { notifyOrderUpdate } from "@/lib/notifications/create";
import { incrementCouponUsage } from "@/lib/coupons/validate";
import { retrieveCheckoutForm } from "@/lib/payments/iyzico";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "").trim();

  if (!token) {
    return new NextResponse("Missing token", { status: 400 });
  }

  const payment = await db.payment.findFirst({
    where: { checkoutToken: token },
    include: { order: true },
  });

  if (!payment) {
    return new NextResponse("OK");
  }

  const order = payment.order;

  if (
    order.status !== OrderStatus.PENDING_PAYMENT &&
    order.status !== OrderStatus.PAID_ESCROW
  ) {
    return NextResponse.redirect(
      `${appUrl()}/musteri/siparisler/${order.id}`,
      303,
    );
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return NextResponse.redirect(
      `${appUrl()}/musteri/siparisler/${order.id}?paid=1`,
      303,
    );
  }

  let retrieveResult;
  try {
    retrieveResult = await retrieveCheckoutForm({
      conversationId: payment.merchantOid,
      token,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ödeme doğrulanamadı";
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failedReason: message,
        rawPayload: JSON.stringify({ token, error: message }),
      },
    });
    return NextResponse.redirect(
      `${appUrl()}/odeme/${order.id}?failed=1`,
      303,
    );
  }

  const rawPayload = JSON.stringify(retrieveResult);

  if (retrieveResult.paymentStatus === "SUCCESS") {
    const paidKurus = retrieveResult.paidPrice
      ? Math.round(parseFloat(retrieveResult.paidPrice) * 100)
      : payment.totalAmountKurus;

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID_ESCROW,
          paidAt: new Date(),
        },
      }),
      db.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.SUCCESS,
          totalAmountKurus: paidKurus,
          providerPaymentId: retrieveResult.paymentId ?? null,
          rawPayload,
        },
      }),
    ]);

    if (order.couponId) {
      await incrementCouponUsage(order.couponId);
    }

    const full = await db.order.findUnique({
      where: { id: order.id },
      include: {
        customer: { select: { id: true, email: true } },
        provider: {
          include: { user: { select: { id: true, email: true } } },
        },
      },
    });

    if (full) {
      const link = `${appUrl()}/musteri/siparisler/${order.id}`;
      await notifyOrderUpdate({
        userId: full.customer.id,
        email: full.customer.email,
        title: "Ödeme alındı",
        body: "Sipariş ödemeniz escrow hesabına alındı.",
        orderTitle: full.title,
        link,
      });
      await notifyOrderUpdate({
        userId: full.provider.user.id,
        email: full.provider.user.email,
        title: "Yeni sipariş",
        body: "Yeni bir ödenmiş siparişiniz var. Kabul edebilirsiniz.",
        orderTitle: full.title,
        link: `${appUrl()}/usta/isler/${order.id}`,
      });
    }

    return NextResponse.redirect(
      `${appUrl()}/musteri/siparisler/${order.id}?paid=1`,
      303,
    );
  }

  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      failedReason:
        retrieveResult.errorMessage ?? "Ödeme tamamlanamadı",
      providerPaymentId: retrieveResult.paymentId ?? null,
      rawPayload,
    },
  });

  return NextResponse.redirect(
    `${appUrl()}/odeme/${order.id}?failed=1`,
    303,
  );
}
