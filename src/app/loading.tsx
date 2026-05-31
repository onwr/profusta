import { BrandLoader } from "@/components/layout/loading-brand";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#f7f7f3] py-16">
      <BrandLoader />
    </div>
  );
}
