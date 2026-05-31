import { IyzicoSettingsForm } from "@/components/admin/iyzico-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminIyzicoSettingsPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Finans"
        title="İyzico ödeme ayarları"
        subtitle="Checkout Form API anahtarları, callback adresi ve sandbox test kimliği"
      />
      <div className="mt-8">
        <IyzicoSettingsForm />
      </div>
    </div>
  );
}
