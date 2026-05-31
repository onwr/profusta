import { CommissionSettingsForm } from "@/components/admin/commission-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminCommissionPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Finans"
        title="Komisyon Ayarları"
        subtitle="Yeni siparişlerde uygulanacak komisyon oranı"
      />
      <div className="mt-8">
        <CommissionSettingsForm />
      </div>
    </div>
  );
}
