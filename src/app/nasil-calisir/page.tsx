import type { Metadata } from "next";
import { HowItWorksPage } from "@/components/marketing/how-it-works-page";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Nasıl Çalışır? | ${APP_NAME}`,
  description:
    "ProfUsta ile hizmet talebi oluşturma, teklif karşılaştırma ve güvenli ödeme sürecini adım adım öğrenin. Müşteri ve usta akışları.",
};

export default function HowItWorksRoutePage() {
  return <HowItWorksPage />;
}
