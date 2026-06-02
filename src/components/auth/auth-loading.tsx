import { BrandLoader } from "@/components/layout/loading-brand";

export function AuthLoading() {
  return (
    <div className="flex min-h-[420px] w-full max-w-[480px] flex-col items-center justify-center rounded-3xl border border-black/5 bg-[#fafaf8]/80 px-8 py-12">
      <BrandLoader
        size="md"
        label="Hazırlanıyor"
        tagline="Bilgileriniz güvenle işleniyor"
      />
    </div>
  );
}
