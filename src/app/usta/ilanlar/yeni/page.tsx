import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ListingForm } from "@/components/listings/listing-form";
import { ROUTES } from "@/lib/constants";

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <Link
        href={ROUTES.provider.listings}
        className="inline-flex items-center gap-2 text-sm font-bold text-[#087a61] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        İlanlarım
      </Link>

      <div>
        <h1 className="text-[28px] font-black leading-tight text-[#083228]">
          Yeni ilan
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          İlanınız admin onayından sonra yayınlanır.
        </p>
      </div>

      <div className="max-w-2xl rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <ListingForm />
      </div>
    </div>
  );
}
