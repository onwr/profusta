import { OffersAdminTable } from "@/components/admin/offers-admin-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOffersPage() {
  const offers = await db.offer.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      provider: {
        include: { user: { select: { fullName: true, email: true } } },
      },
      request: {
        include: { category: { select: { name: true } } },
      },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="Teklifler"
        subtitle="Platformdaki tüm teklifleri izleyin"
      />
      <div className="mt-8">
        <OffersAdminTable offers={offers} />
      </div>
    </div>
  );
}
