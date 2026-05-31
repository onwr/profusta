import type { LucideIcon } from "lucide-react";
import {
  ClipboardEdit,
  CreditCard,
  GitCompareArrows,
  Handshake,
  PartyPopper,
  ShieldCheck,
  Star,
} from "lucide-react";

export type HowItWorksStep = {
  number: string;
  title: string;
  text: string;
  description: string;
  bullets: string[];
  icon: LucideIcon;
};

export const MAIN_STEPS: HowItWorksStep[] = [
  {
    number: "1",
    title: "İhtiyacınızı Belirtin",
    text: "Hangi hizmete ihtiyacınız olduğunu ve detayları paylaşın.",
    description:
      "Kategori seçerek talebinizi oluşturun. Sorununuzu, konumunuzu ve tercih ettiğiniz zamanı birkaç dakikada paylaşın.",
    bullets: [
      "Elektrik, tesisat, klima ve daha fazlası",
      "Fotoğraf ekleyerek ustalara net bilgi verin",
      "İsterseniz belirli bir ustaya özel talep gönderin",
    ],
    icon: ClipboardEdit,
  },
  {
    number: "2",
    title: "Teklifleri Karşılaştırın",
    text: "Ustalar size teklif gönderir, fiyat ve yorumları karşılaştırın.",
    description:
      "Onaylı ustalar talebinizi görür ve size fiyat teklifi gönderir. Teklifleri yan yana karşılaştırarak en uygun seçeneği belirleyin.",
    bullets: [
      "Birden fazla ustadan ücretsiz teklif alın",
      "Puan, yorum ve mesafe bilgilerini inceleyin",
      "Ustalarla mesajlaşarak detay sorabilirsiniz",
    ],
    icon: GitCompareArrows,
  },
  {
    number: "3",
    title: "Ustanızı Seçin",
    text: "Size en uygun ustayı seçin ve işlemi başlatın.",
    description:
      "Beğendiğiniz teklifi kabul edin. Ödeme güvenli şekilde platform üzerinden yapılır; iş bitene kadar koruma altındasınız.",
    bullets: [
      "Tek tıkla teklif kabulü",
      "Güvenli ödeme (escrow) ile koruma",
      "Randevu ve iş detaylarını netleştirin",
    ],
    icon: Handshake,
  },
  {
    number: "4",
    title: "İşiniz Tamamlansın",
    text: "İşiniz tamamlandığında değerlendirme yapın.",
    description:
      "Usta işinizi tamamladığında onay verirsiniz. Memnun kaldıysanız değerlendirme yapın; sorun varsa destek ekibimiz yanınızda.",
    bullets: [
      "İş tamamlandıktan sonra ödeme ustaya aktarılır",
      "Puan ve yorum ile deneyiminizi paylaşın",
      "İade ve itiraz süreçleri şeffaf şekilde yönetilir",
    ],
    icon: PartyPopper,
  },
];

export const CUSTOMER_FLOW = [
  {
    step: "1",
    title: "Ücretsiz kayıt olun",
    text: "Hesap oluşturun veya giriş yapın.",
  },
  {
    step: "2",
    title: "Talep oluşturun",
    text: "İhtiyacınızı ve konumunuzu paylaşın.",
  },
  {
    step: "3",
    title: "Teklif alın ve seçin",
    text: "Ustalardan gelen teklifleri karşılaştırın.",
  },
] as const;

export const PROVIDER_FLOW = [
  {
    step: "1",
    title: "Başvurunuzu gönderin",
    text: "Kimlik ve hizmet bilgilerinizi paylaşın.",
  },
  {
    step: "2",
    title: "Onay sonrası talepleri görün",
    text: "Bölgenizdeki müşteri taleplerine teklif verin.",
  },
  {
    step: "3",
    title: "İşi tamamlayın, kazanın",
    text: "Tamamlanan işlerin ödemesini güvenle alın.",
  },
] as const;

export const TRUST_CARDS = [
  {
    title: "Onaylı ustalar",
    text: "Tüm ustalar kimlik ve hizmet onayından geçer. Profilleri ve yorumları şeffaf şekilde görüntülenir.",
    icon: ShieldCheck,
  },
  {
    title: "Güvenli ödeme",
    text: "Ödemeniz iş tamamlanana kadar güvende tutulur. Memnuniyet onayından sonra usta hakedişi aktarılır.",
    icon: CreditCard,
  },
  {
    title: "Şeffaf değerlendirme",
    text: "Gerçek müşteri yorumları ve puanlar teklif kararınızı kolaylaştırır.",
    icon: Star,
  },
] as const;
