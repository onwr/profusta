import { LegalPage } from "@/components/layout/legal-page";

export default function AboutPage() {
  return (
    <LegalPage title="Hakkımızda">
      <p>
        ProfUSTA, ev teknik servis ihtiyaçlarınız için güvenilir ustalarla
        sizi buluşturan bir hizmet pazaryeridir. Talep oluşturarak teklif
        alabilir veya ilanlardan doğrudan hizmet satın alabilirsiniz.
      </p>
      <p className="mt-4">
        Misyonumuz; şeffaf fiyatlandırma, güvenli ödeme ve kaliteli hizmet
        deneyimi sunmaktır.
      </p>
    </LegalPage>
  );
}
