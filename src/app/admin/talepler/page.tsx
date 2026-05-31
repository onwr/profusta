import { AdminRequestsTable } from "@/components/admin/requests-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export default async function AdminRequestsPage() {
  const requests = await db.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { fullName: true, email: true } },
      category: { select: { name: true } },
      service: { select: { name: true } },
      _count: { select: { matches: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="Talepler"
        subtitle="Müşteri hizmet taleplerini görüntüleyin."
      />
      <div className="mt-8">
        <AdminRequestsTable requests={requests} />
      </div>
    </div>
  );
}
