import { toSlug } from "../src/lib/slug";

export type SeedCategory = {
  name: string;
  icon: string;
  description: string;
  services: { name: string; description?: string }[];
};

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: "Klima",
    icon: "Wind",
    description: "Klima montaj, bakım ve arıza servisi",
    services: [
      { name: "Klima montajı" },
      { name: "Klima bakımı" },
      { name: "Klima gaz dolumu" },
      { name: "Klima arıza tamiri" },
    ],
  },
  {
    name: "Kombi",
    icon: "Flame",
    description: "Kombi bakım, montaj ve petek işlemleri",
    services: [
      { name: "Kombi bakımı" },
      { name: "Kombi montajı" },
      { name: "Kombi arıza tamiri" },
    ],
  },
  {
    name: "Elektrikçi",
    icon: "Zap",
    description: "Elektrik tesisatı ve aydınlatma işleri",
    services: [
      { name: "Priz değişimi" },
      { name: "Avize montajı" },
      { name: "Sigorta panosu işleri" },
      { name: "Aydınlatma kurulumu" },
    ],
  },
  {
    name: "Tesisatçı",
    icon: "Droplets",
    description: "Su tesisatı ve sıhhi tesisat hizmetleri",
    services: [
      { name: "Musluk değişimi" },
      { name: "Tıkanıklık açma" },
      { name: "Su kaçağı tamiri" },
    ],
  },
  {
    name: "Petek Temizliği",
    icon: "Thermometer",
    description: "Petek temizliği ve ısıtma verimliliği",
    services: [
      { name: "Petek temizliği" },
      { name: "Kalorifer bakımı" },
    ],
  },
  {
    name: "Beyaz Eşya Tamiri",
    icon: "Sparkles",
    description: "Beyaz eşya arıza ve bakım",
    services: [
      { name: "Beyaz eşya tamiri" },
      { name: "Çamaşır makinesi tamiri" },
      { name: "Bulaşık makinesi tamiri" },
    ],
  },
  {
    name: "Mobilya Montajı",
    icon: "Hammer",
    description: "Mobilya kurulum ve montaj",
    services: [
      { name: "Mobilya kurulumu" },
      { name: "Dolap montajı" },
      { name: "TV ünitesi montajı" },
    ],
  },
  {
    name: "Korniş / Perde Montajı",
    icon: "Home",
    description: "Korniş ve perde montaj hizmetleri",
    services: [
      { name: "Korniş montajı" },
      { name: "Perde montajı" },
    ],
  },
  {
    name: "Uydu / TV Kurulumu",
    icon: "Tv",
    description: "TV ve uydu kurulum işleri",
    services: [
      { name: "TV duvar montajı" },
      { name: "Uydu kurulumu" },
      { name: "Anten ayarı" },
    ],
  },
  {
    name: "Çilingir",
    icon: "KeyRound",
    description: "Kilit ve çilingir hizmetleri",
    services: [
      { name: "Kapı kilidi değişimi" },
      { name: "Acil çilingir" },
    ],
  },
];

export function categorySlug(name: string) {
  return toSlug(name);
}

export function serviceSlug(name: string) {
  return toSlug(name);
}
