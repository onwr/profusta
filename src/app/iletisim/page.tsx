import { LegalPage } from "@/components/layout/legal-page";

export default function ContactPage() {
  return (
    <LegalPage title="İletişim">
      <p>
        Sorularınız için bize ulaşın:{" "}
        <a href="mailto:destek@profusta.com" className="font-semibold text-[#087a61]">
          destek@profusta.com
        </a>
      </p>
      <p className="mt-4">Çalışma saatleri: Hafta içi 09:00 – 18:00</p>
    </LegalPage>
  );
}
