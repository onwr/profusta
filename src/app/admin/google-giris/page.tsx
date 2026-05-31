import { GoogleOAuthSettingsForm } from "@/components/admin/google-oauth-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default function AdminGoogleOAuthPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Ayarlar"
        title="Google giriş ayarları"
        subtitle="Google ile giriş ve kayıt (OAuth 2.0) — Client ID ve Secret"
      />
      <div className="mt-8">
        <GoogleOAuthSettingsForm />
      </div>
    </div>
  );
}
