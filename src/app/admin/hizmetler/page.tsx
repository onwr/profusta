import { ServiceManager } from "@/components/admin/service-manager";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export default async function AdminServicesPage() {
  const [services, categories] = await Promise.all([
    db.service.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            coverImageUrl: true,
          },
        },
      },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        coverImageUrl: true,
      },
    }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Alt Hizmetler"
        subtitle="Kategorilere bağlı alt hizmetleri yönetin."
      />
      <div className="mt-8">
        <ServiceManager services={services} categories={categories} />
      </div>
    </div>
  );
}
