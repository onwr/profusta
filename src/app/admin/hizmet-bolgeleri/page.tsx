import { ServiceAreasForm } from "@/components/admin/service-areas-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export const dynamic = "force-dynamic";

export default function AdminServiceAreasPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Ayarlar"
        title="Hizmet bölgeleri"
        subtitle="Platformda hizmet verilebilen il ve ilçeleri yönetin. Header konum seçici, talep ve ilan formları bu listeye göre çalışır."
      />
      <div className="mt-8">
        <ServiceAreasForm />
      </div>
    </div>
  );
}
