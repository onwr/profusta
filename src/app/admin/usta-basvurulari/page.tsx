import { ProviderApplications } from "@/components/admin/provider-applications";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export default async function AdminApplicationsPage() {
  const providers = await db.provider.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { fullName: true, email: true, phone: true },
      },
      categories: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const serialized = providers.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="Usta Başvuruları"
        subtitle={`${serialized.length} onay bekleyen başvuru`}
      />
      <div className="mt-6">
        <ProviderApplications providers={serialized} />
      </div>
    </div>
  );
}
