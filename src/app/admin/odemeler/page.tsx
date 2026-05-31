import { AdminPayoutsTable } from "@/components/admin/admin-payouts-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { BalanceEntryType, PaymentStatus, PayoutStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const balanceTypeLabels: Record<BalanceEntryType, string> = {
  CREDIT: "Usta kazancı (escrow aktarımı)",
  DEBIT: "Bakiye düşümü",
  PAYOUT: "Çekim",
};

export default async function AdminPaymentsPage() {
  const [payments, balanceEntries, payouts] = await Promise.all([
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        order: {
          select: {
            id: true,
            title: true,
            merchantOid: true,
            amount: true,
            status: true,
            customer: { select: { fullName: true } },
          },
        },
      },
    }),
    db.providerBalance.findMany({
      orderBy: { createdAt: "desc" },
      take: 80,
      include: {
        provider: {
          include: { user: { select: { fullName: true } } },
        },
        order: {
          select: {
            id: true,
            title: true,
            merchantOid: true,
            amount: true,
            status: true,
          },
        },
      },
    }),
    db.payout.findMany({
      where: { status: PayoutStatus.PENDING },
      orderBy: { createdAt: "desc" },
      include: {
        provider: { include: { user: { select: { fullName: true } } } },
      },
    }),
  ]);

  const successfulPayments = payments.filter(
    (p) => p.status === PaymentStatus.SUCCESS,
  );

  return (
    <div>
      <AdminPageHeader
        eyebrow="Finans"
        title="Ödemeler"
        subtitle="Müşteri tahsilatları, usta bakiye hareketleri ve çekim talepleri"
      />

      <section className="mt-10">
        <h2 className="font-bold text-[#083228]">Usta bakiye hareketleri</h2>
        <p className="mt-1 text-sm text-[#53635f]">
          Müşteri işi onayladıktan sonra ustaya yansıyan net tutarlar (CREDIT)
        </p>
        {balanceEntries.length === 0 ? (
          <p className="mt-4 text-sm text-[#53635f]">Henüz hareket yok.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {balanceEntries.map((e) => (
              <article
                key={e.id}
                className="rounded-2xl border border-black/5 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[#083228]">
                      {e.provider.user.fullName}
                    </p>
                    <p className="text-xs text-[#53635f]">
                      {balanceTypeLabels[e.type]}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-black ${
                      e.type === BalanceEntryType.CREDIT
                        ? "text-[#087a61]"
                        : "text-[#083228]"
                    }`}
                  >
                    {e.type === BalanceEntryType.CREDIT ? "+" : "-"}
                    {e.amount.toLocaleString("tr-TR")} ₺
                  </p>
                </div>
                {e.order ? (
                  <div className="mt-3 rounded-xl bg-[#fafaf8] px-3 py-2 text-sm">
                    <p className="font-semibold text-[#083228]">
                      {e.order.title}
                    </p>
                    <p className="text-xs text-[#53635f]">
                      Sipariş: {e.order.merchantOid} · Durum: {e.order.status}{" "}
                      · Brüt: {e.order.amount.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                ) : null}
                {e.note ? (
                  <p className="mt-2 text-xs text-[#53635f]">{e.note}</p>
                ) : null}
                <p className="mt-2 text-xs text-[#7b8b87]">
                  {e.createdAt.toLocaleString("tr-TR")}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-[#083228]">Müşteri ödemeleri (İyzico)</h2>
        <div className="mt-4 space-y-3">
          {successfulPayments.length === 0 ? (
            <p className="text-sm text-[#53635f]">Başarılı ödeme kaydı yok.</p>
          ) : (
            successfulPayments.map((p) => (
              <article
                key={p.id}
                className="rounded-2xl border border-black/5 bg-white p-5"
              >
                <p className="font-bold">{p.order.title}</p>
                <p className="text-sm text-[#53635f]">
                  Müşteri: {p.order.customer.fullName} · {p.order.merchantOid}
                </p>
                <p className="mt-2 text-sm">
                  Durum:{" "}
                  <span className="font-semibold text-[#087a61]">
                    {p.status}
                  </span>
                  {" · "}
                  {(p.totalAmountKurus / 100).toLocaleString("tr-TR")} ₺
                </p>
                <p className="text-xs text-[#7b8b87]">
                  {p.createdAt.toLocaleString("tr-TR")}
                </p>
              </article>
            ))
          )}
        </div>
        {payments.some((p) => p.status !== PaymentStatus.SUCCESS) ? (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#53635f]">
              Bekleyen / başarısız ödeme denemeleri (
              {payments.filter((p) => p.status !== PaymentStatus.SUCCESS).length})
            </summary>
            <div className="mt-3 space-y-2">
              {payments
                .filter((p) => p.status !== PaymentStatus.SUCCESS)
                .map((p) => (
                  <article
                    key={p.id}
                    className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 text-sm"
                  >
                    <p className="font-semibold">{p.order.title}</p>
                    <p>
                      {p.status}
                      {p.failedReason ? ` — ${p.failedReason}` : ""}
                    </p>
                  </article>
                ))}
            </div>
          </details>
        ) : null}
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-[#083228]">Usta ödeme talepleri (çekim)</h2>
        <div className="mt-4">
          <AdminPayoutsTable payouts={payouts} />
        </div>
      </section>
    </div>
  );
}
