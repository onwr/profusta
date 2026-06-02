import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageAdminManager } from "@/components/admin/homepage-admin-manager";
import {
  getHomepageConfigForAdmin,
  getHomepageItemsForAdmin,
} from "@/lib/homepage/get-homepage-content";

export default async function AdminHomepagePage() {
  const [config, items] = await Promise.all([
    getHomepageConfigForAdmin(),
    getHomepageItemsForAdmin(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="İçerik"
        title="Anasayfa"
        subtitle="Ana sayfa metinleri, görselleri ve vitrin içeriklerini yönetin. Kategori listesi /admin/kategoriler üzerinden gelir."
      />
      <HomepageAdminManager
        initialConfig={config}
        initialItems={items}
      />
    </div>
  );
}
