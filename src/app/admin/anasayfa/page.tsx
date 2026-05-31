import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { HomepageAdminManager } from "@/components/admin/homepage-admin-manager";
import {
  getHomepageConfigForAdmin,
  getHomepageItemsForAdmin,
  getHomepagePickersForAdmin,
  hasManualFeaturedServices,
} from "@/lib/homepage/get-homepage-content";

export default async function AdminHomepagePage() {
  const [config, items, pickers, manualFeatured] = await Promise.all([
    getHomepageConfigForAdmin(),
    getHomepageItemsForAdmin(),
    getHomepagePickersForAdmin(),
    hasManualFeaturedServices(),
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
        pickers={pickers}
        manualFeatured={manualFeatured}
      />
    </div>
  );
}
