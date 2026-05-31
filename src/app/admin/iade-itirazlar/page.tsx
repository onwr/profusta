import { DisputeStatus, RefundStatus } from "@/generated/prisma/client";
import { DisputeAdminTable } from "@/components/admin/dispute-admin-table";
import { RefundAdminTable } from "@/components/admin/refund-admin-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminRefundsDisputesPage() {
  const [refunds, disputes] = await Promise.all([
    db.refund.findMany({
      where: { status: RefundStatus.PENDING },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            customer: { select: { fullName: true } },
            provider: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
      },
    }),
    db.dispute.findMany({
      where: { status: DisputeStatus.OPEN },
      orderBy: { createdAt: "desc" },
      include: {
        order: {
          include: {
            customer: { select: { fullName: true } },
            provider: {
              include: { user: { select: { fullName: true } } },
            },
          },
        },
        customer: { select: { fullName: true } },
      },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Finans"
        title="İade ve İtirazlar"
        subtitle="Bekleyen iadeleri ve açık itirazları yönetin"
      />

      <section className="mt-10">
        <h2 className="font-bold text-[#083228]">Bekleyen iadeler</h2>
        <div className="mt-4">
          <RefundAdminTable refunds={refunds} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-[#083228]">Açık itirazlar</h2>
        <div className="mt-4">
          <DisputeAdminTable disputes={disputes} />
        </div>
      </section>
    </div>
  );
}
