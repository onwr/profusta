import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  Hash,
  User,
  Wallet,
} from "lucide-react";
import { OrderStatus } from "@/generated/prisma/client";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderDisputePanel } from "@/components/orders/order-dispute-panel";
import { OrderSourceCard } from "@/components/orders/order-source-card";
import { ProviderCancelForm } from "@/components/orders/provider-cancel-form";
import { ProviderOrderStatus } from "@/components/provider/provider-order-status";
import { isProviderCompletedStatus } from "@/lib/provider/job-statuses";
import { getCurrentUser } from "@/lib/auth/session";
import { getOrderForUser } from "@/lib/orders/access";
import { getOrderDetailExtras } from "@/lib/orders/order-detail-data";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

function formatDate(d: Date | null | undefined) {
  if (!d) return null;
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ProviderJobDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?redirect=/usta/isler");

  const { id } = await params;
  const result = await getOrderForUser(id, user);
  if (!result || !result.isProvider) notFound();

  const { order } = result;
  const extras = await getOrderDetailExtras(id);

  const isCompleted = isProviderCompletedStatus(order.status);
  const backHref = isCompleted
    ? ROUTES.provider.jobsCompleted
    : ROUTES.provider.jobs;
  const backLabel = isCompleted ? "Tamamlanan işler" : "Aktif işler";

  const canCancel =
    order.status === OrderStatus.PAID_ESCROW ||
    order.status === OrderStatus.PROVIDER_ACCEPTED ||
    order.status === OrderStatus.IN_PROGRESS;

  const needsAction =
    order.status === OrderStatus.PAID_ESCROW ||
    order.status === OrderStatus.PROVIDER_ACCEPTED ||
    order.status === OrderStatus.IN_PROGRESS;

  const actionHint: Record<string, string> = {
    PAID_ESCROW: "İşi kabul ederek süreci başlatın.",
    PROVIDER_ACCEPTED: "Hazırsanız işe başlayın.",
    IN_PROGRESS: "İşi bitirdiğinizde tamamlandı olarak işaretleyin.",
    COMPLETED_BY_PROVIDER: "Müşteri onayı bekleniyor.",
    DISPUTED: "İtiraz sürecini aşağıdan yönetin.",
  };

  const customerInitial = order.customer.fullName.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#087a61] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[28px] font-black leading-tight text-[#083228]">
              {order.title}
            </h1>
            <ProviderOrderStatus status={order.status} />
          </div>
          <p className="mt-2 flex items-center gap-2 text-sm text-[#5a7a72]">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-[#064a3f] to-[#087a61] text-xs font-black text-white">
              {customerInitial}
            </span>
            {order.customer.fullName}
          </p>
        </div>

        <div className="rounded-2xl border border-[#087a61]/20 bg-[#eef8f5] px-5 py-4 text-right">
          <p className="text-xs font-semibold text-[#5a7a72]">İş tutarı</p>
          <p className="text-[28px] font-black leading-tight text-[#083228]">
            ₺{order.amount.toLocaleString("tr-TR")}
          </p>
          <p className="mt-1 text-sm font-bold text-[#10b981]">
            Net ₺{order.netAmount.toLocaleString("tr-TR")}
          </p>
          {order.commissionAmount > 0 ? (
            <p className="mt-0.5 text-[11px] text-[#5a7a72]">
              Komisyon ₺{order.commissionAmount.toLocaleString("tr-TR")}
            </p>
          ) : null}
        </div>
      </div>

      {order.status === OrderStatus.DISPUTED ? (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" />
          <div>
            <p className="text-sm font-black text-orange-900">İtiraz açık</p>
            <p className="mt-1 text-sm text-orange-800">
              Müşteri itiraz açtı. Mesaj bırakabilir veya düzeltmeyi onaya
              gönderebilirsiniz.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-7">
          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-black text-[#083228]">İş açıklaması</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[#5a7a72]">
              {order.description}
            </p>
          </section>

          {extras.sourceType ? (
            <div className="[&>div]:mt-0">
              <OrderSourceCard
                sourceType={extras.sourceType}
                privateOffer={extras.privateOffer}
                listingTitle={extras.listingTitle}
                requestCategory={extras.requestCategory}
              />
            </div>
          ) : null}

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-black text-[#083228]">
              Sipariş bilgileri
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[#5a7a72]">
              <li className="flex items-center gap-3">
                <Hash className="h-4 w-4 shrink-0 text-[#087a61]" />
                <span className="font-mono text-xs text-[#083228]">
                  {order.merchantOid}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <User className="h-4 w-4 shrink-0 text-[#087a61]" />
                {order.customer.fullName}
                {order.customer.phone ? (
                  <span className="text-[#9ca3af]">· {order.customer.phone}</span>
                ) : null}
              </li>
              <li className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-[#087a61]" />
                Oluşturulma: {formatDate(order.createdAt)}
              </li>
              {order.paidAt ? (
                <li className="flex items-center gap-3">
                  <Wallet className="h-4 w-4 shrink-0 text-[#087a61]" />
                  Ödeme: {formatDate(order.paidAt)}
                </li>
              ) : null}
              {order.completedAt ? (
                <li className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 shrink-0 text-[#10b981]" />
                  Tamamlanma: {formatDate(order.completedAt)}
                </li>
              ) : null}
            </ul>
          </section>
        </div>

        <div className="space-y-6 xl:col-span-5">
          <section className="sticky top-24 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-[15px] font-black text-[#083228]">İşlemler</h2>
            {actionHint[order.status] ? (
              <p className="mt-2 text-xs leading-relaxed text-[#5a7a72]">
                {actionHint[order.status]}
              </p>
            ) : null}

            <div
              className={
                needsAction
                  ? "mt-4 rounded-xl bg-[#eef8f5] p-4 [&_button]:w-full [&_button]:rounded-xl [&_button]:bg-[#087a61] [&_button]:font-bold [&_button]:hover:bg-[#066b54]"
                  : "mt-4 [&_button]:w-full [&_button]:rounded-xl"
              }
            >
              <OrderActions
                orderId={order.id}
                status={order.status}
                isCustomer={false}
                isProvider
              />
            </div>

            {!needsAction &&
            order.status !== OrderStatus.DISPUTED &&
            order.status !== OrderStatus.COMPLETED_BY_PROVIDER ? (
              <p className="mt-4 text-center text-xs text-[#9ca3af]">
                Bu aşamada yapılacak işlem yok.
              </p>
            ) : null}
          </section>

          {canCancel ? (
            <section className="rounded-2xl border border-red-200/80 bg-red-50/50 p-6">
              <ProviderCancelForm orderId={order.id} />
            </section>
          ) : null}
        </div>
      </div>

      <OrderDisputePanel
        orderId={order.id}
        orderStatus={order.status}
        disputes={extras.disputes}
        isCustomer={false}
        isProvider
      />
    </div>
  );
}
