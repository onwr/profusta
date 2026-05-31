import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-card";
import { ROUTES } from "@/lib/constants";

export default function ProviderPendingPage() {
  return (
    <AuthCard
      title="Onay Bekleniyor"
      subtitle="Usta başvurunuz inceleniyor. Admin onayından sonra panele erişebilirsiniz."
      footer={
        <Link href={ROUTES.home} className="font-bold text-[#087a61]">
          Ana sayfaya dön
        </Link>
      }
    >
      <p className="text-sm text-[#53635f]">
        Onay süreci genellikle 1–2 iş günü sürer. Sorularınız için destek
        ekibimizle iletişime geçebilirsiniz.
      </p>
    </AuthCard>
  );
}
