import { LegalPage } from "@/components/layout/legal-page";

export default function FaqPage() {
  return (
    <LegalPage title="Sıkça Sorulan Sorular">
      <h2 className="text-lg font-bold text-[#083228]">Nasıl talep oluştururum?</h2>
      <p className="mt-2">
        Giriş yaptıktan sonra kategori seçip talep formunu doldurmanız yeterlidir.
      </p>
      <h2 className="mt-6 text-lg font-bold text-[#083228]">Ödeme güvende mi?</h2>
      <p className="mt-2">
        Ödemeler iş tamamlanana kadar sistemde bekletilir; memnuniyet onayından
        sonra usta hakedişi aktarılır.
      </p>
    </LegalPage>
  );
}
