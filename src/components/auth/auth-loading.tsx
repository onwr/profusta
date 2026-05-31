import { BrandLoader } from "@/components/layout/loading-brand";

export function AuthLoading() {
  return (
    <div className="flex min-h-[360px] w-full max-w-[480px] items-center justify-center">
      <BrandLoader size="md" />
    </div>
  );
}
