import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { AuthLoading } from "@/components/auth/auth-loading";
import { CreateRequestForm } from "@/components/requests/create-request-form";

export default function CreateRequestPage() {
  return (
    <div className="bg-[#f7f7f3] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#e5f3ef] px-4 py-1.5 text-[12px] font-black tracking-wide text-[#087a61]">
            <ShieldCheck className="h-3.5 w-3.5" />
            ProfUsta güvencesiyle
          </span>
          <h1 className="mt-4 text-[28px] font-black leading-tight tracking-[-0.02em] text-[#083228] sm:text-3xl">
            Hizmet Talep Oluştur
          </h1>
          <p className="mt-2 text-sm text-[#53635f]">
            İhtiyacınız olan hizmeti seçin, detayları paylaşın. En uygun ustalar
            size teklif versin.
          </p>
        </div>
        <div className="mt-8">
          <Suspense fallback={<AuthLoading />}>
            <CreateRequestForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
