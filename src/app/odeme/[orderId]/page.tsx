import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentCheckout } from "@/components/payments/payment-checkout";
import { OrderStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/access";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ failed?: string }>;
};

export default async function PaymentPage({ params, searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const { orderId } = await params;
  const { failed } = await searchParams;
  const result = await getOrderForUser(orderId, user);
  if (!result || !result.isCustomer) notFound();

  const { order } = result;

  if (order.status === OrderStatus.PAID_ESCROW) {
    redirect(`${ROUTES.customer.orders}/${orderId}?paid=1`);
  }

  if (order.status !== OrderStatus.PENDING_PAYMENT) {
    redirect(`${ROUTES.customer.orders}/${orderId}`);
  }

  return (
    <div className="bg-[#f7f7f3] px-8 py-12 sm:px-12 lg:px-16">
      <Link
        href={`${ROUTES.customer.orders}/${orderId}`}
        className="text-sm font-semibold text-[#087a61] hover:underline"
      >
        ← Sipariş detayı
      </Link>
      <h1 className="mt-6 text-2xl font-black text-[#083228]">Ödeme</h1>
      {failed ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Ödeme tamamlanamadı. Tekrar deneyebilirsiniz.
        </p>
      ) : null}
      <div className="mt-8 max-w-3xl">
        <PaymentCheckout
          orderId={orderId}
          title={order.title}
          initialAmount={order.amount}
          initialDiscount={order.discountAmount}
          initialCouponCode={order.couponCode}
          customerPhone={order.customer.phone}
        />
      </div>
    </div>
  );
}
