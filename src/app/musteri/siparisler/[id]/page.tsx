import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Hash,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { OrderStatus } from "@/generated/prisma/client";
import { OrderActions } from "@/components/orders/order-actions";
import { OrderCancelForm } from "@/components/orders/order-cancel-form";
import { OrderDisputeForm } from "@/components/orders/order-dispute-form";
import { OrderDisputePanel } from "@/components/orders/order-dispute-panel";
import { OrderSourceCard } from "@/components/orders/order-source-card";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { ReviewForm } from "@/components/orders/review-form";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { getOrderForUser } from "@/lib/orders/access";
import { getOrderDetailExtras } from "@/lib/orders/order-detail-data";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function CustomerOrderDetailPage({
  params,
  searchParams,
}: Props) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?redirect=/musteri/siparisler");

  const { id } = await params;
  const { paid } = await searchParams;

  const result = await getOrderForUser(id, user);
  if (!result || !result.isCustomer) notFound();

  const { order } = result;

  const [review, openDispute, extras] = await Promise.all([
    db.review.findUnique({ where: { orderId: id } }),
    db.dispute.findFirst({
      where: { orderId: id, status: "OPEN" },
    }),
    getOrderDetailExtras(id),
  ]);

  const showCancel =
    order.status === OrderStatus.PAID_ESCROW ||
    order.status === OrderStatus.PROVIDER_ACCEPTED ||
    order.status === OrderStatus.IN_PROGRESS;

  const showDispute =
    (order.status === OrderStatus.COMPLETED_BY_PROVIDER ||
      order.status === OrderStatus.COMPLETED) &&
    !openDispute;

  const showReview = order.status === OrderStatus.COMPLETED && !review;

  return (
    <div className="space-y-8">
      <Link
        href={ROUTES.customer.orders}
        className="inline-flex items-center gap-2 text-sm font-black text-[#087a61] transition hover:text-[#06644f]"
      >
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime Dön
      </Link>

      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-[#099fd8]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
              <ClipboardList className="h-4 w-4" />
              Sipariş Detayı
            </div>

            <h1 className="max-w-[760px] text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
              {order.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-[#53635f]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                <UserRound className="h-4 w-4 text-[#087a61]" />
                {order.provider.user.fullName}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                <Hash className="h-4 w-4 text-[#087a61]" />
                {order.merchantOid}
              </span>
            </div>
          </div>

          <OrderStatusBadge status={order.status} />
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <InfoStat
            icon={<CreditCard className="h-5 w-5" />}
            value={`${order.amount.toLocaleString("tr-TR")} ₺`}
            label="Sipariş Tutarı"
          />
          <InfoStat
            icon={<ShieldCheck className="h-5 w-5" />}
            value="Güvende"
            label="ProfUsta ödeme koruması"
          />
          <InfoStat
            icon={<Calendar className="h-5 w-5" />}
            value={new Date(order.createdAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "short",
            })}
            label="Sipariş tarihi"
          />
        </div>
      </section>

      {paid ? (
        <AlertBox
          type="success"
          title="Ödeme bildirimi alındı"
          text="Onay birkaç saniye sürebilir. Sipariş durumunuz otomatik güncellenecektir."
        />
      ) : null}

      {order.status === OrderStatus.DISPUTED ? (
        <AlertBox
          type="warning"
          title="Bu sipariş itiraz sürecinde"
          text="Aşağıdaki geçmiş ve usta yanıtlarını inceleyebilirsiniz."
        />
      ) : null}

      {order.status === OrderStatus.COMPLETED_BY_PROVIDER &&
      order.providerCompletedAt ? (
        <AlertBox
          type="warning"
          title="Usta işi tamamladı"
          text="48 saat içinde onaylamaz veya itiraz oluşturmazsanız sistem otomatik onaylayacaktır."
        />
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <main className="space-y-6">
          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-[#083228]">
                Sipariş Açıklaması
              </h2>
              <p className="mt-1 text-sm text-[#53635f]">
                Hizmet kapsamında yer alan detaylar
              </p>
            </div>

            <div className="rounded-[24px] bg-[#FBFDF5] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#53635f]">
                {order.description || "Açıklama eklenmemiş."}
              </p>
            </div>
          </section>

          {extras.sourceType ? (
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black text-[#083228]">
                  Sipariş Kaynağı
                </h2>
                <p className="mt-1 text-sm text-[#53635f]">
                  Siparişin hangi akıştan oluştuğu
                </p>
              </div>

              <OrderSourceCard
                sourceType={extras.sourceType}
                privateOffer={extras.privateOffer}
                listingTitle={extras.listingTitle}
                requestCategory={extras.requestCategory}
              />
            </section>
          ) : null}

          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-[#083228]">
                Sipariş İşlemleri
              </h2>
              <p className="mt-1 text-sm text-[#53635f]">
                Sipariş durumuna göre yapabileceğiniz işlemler
              </p>
            </div>

            <div className="mt-4 rounded-xl bg-[#eef8f5] p-4 [&_button]:w-full [&_button]:rounded-xl [&_button]:bg-[#087a61] [&_button]:font-bold [&_button]:hover:bg-[#066b54]">
              <OrderActions
                orderId={order.id}
                status={order.status}
                isCustomer
                isProvider={false}
              />
            </div>
          </section>

          {showCancel ? (
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <OrderCancelForm orderId={order.id} />
            </section>
          ) : null}

          {showDispute ? (
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <OrderDisputeForm orderId={order.id} />
            </section>
          ) : null}

          {showReview ? (
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <ReviewForm orderId={order.id} />
            </section>
          ) : null}

          {review ? (
            <section className="rounded-[28px] border border-[#087a61]/15 bg-[#FBFDF5] p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div>
                  <h3 className="font-black text-[#083228]">
                    Değerlendirmeniz alındı
                  </h3>
                  <p className="mt-1 text-sm text-[#53635f]">
                    Bu sipariş için {review.rating}/5 puan verdiniz.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <OrderDisputePanel
            orderId={order.id}
            orderStatus={order.status}
            disputes={extras.disputes}
            isCustomer
            isProvider={false}
          />
        </main>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#083228]">
              Sipariş Özeti
            </h2>

            <div className="mt-5 space-y-4">
              <DetailRow label="Usta" value={order.provider.user.fullName} />
              <DetailRow
                label="Tutar"
                value={`${order.amount.toLocaleString("tr-TR")} ₺`}
              />
              <DetailRow label="Sipariş No" value={order.merchantOid} />
              <DetailRow
                label="Durum"
                value={String(order.status)}
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-[#083228] p-6 text-white shadow-sm">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-[#a8e6d5]">
              <Sparkles className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-black">
              Güvenli Hizmet Süreci
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/70">
              Ödemeniz hizmet tamamlanana kadar ProfUsta güvencesinde tutulur.
            </p>

            <Link
              href={ROUTES.customer.messages}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-[#083228]"
            >
              <MessageCircle className="h-4 w-4" />
              Mesajlara Git
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
          {icon}
        </div>

        <div>
          <p className="text-2xl font-black text-[#083228]">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-[#53635f]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function AlertBox({
  type,
  title,
  text,
}: {
  type: "success" | "warning";
  title: string;
  text: string;
}) {
  const isSuccess = type === "success";

  return (
    <div
      className={[
        "rounded-[24px] border p-5",
        isSuccess
          ? "border-[#087a61]/15 bg-[#eef8f5] text-[#087a61]"
          : "border-amber-200 bg-amber-50 text-amber-900",
      ].join(" ")}
    >
      <div className="flex gap-4">
        {isSuccess ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        )}

        <div>
          <h3 className="font-black">{title}</h3>
          <p className="mt-1 text-sm leading-6 opacity-80">{text}</p>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-[#FBFDF5] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#087a61]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold leading-6 text-[#53635f]">
        {value}
      </p>
    </div>
  );
}