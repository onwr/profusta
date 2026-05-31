import {
  CategoryAdminPanel,
  type CategoryAdminRow,
} from "@/components/admin/category-admin-panel";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { services: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Kategoriler"
        subtitle="Kapak görselleri, sıralama ve açıklamalar dahil ana hizmet kategorilerini yönetin."
      />
      <div className="mt-8">
        <CategoryAdminPanel
          categories={categories as CategoryAdminRow[]}
        />
      </div>
    </div>
  );
}
