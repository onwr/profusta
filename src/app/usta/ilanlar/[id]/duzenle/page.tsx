import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ListingForm } from "@/components/listings/listing-form";
import { ListingStatus } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const user = await getCurrentUser();
  const providerId = user?.provider?.id;
  if (!providerId) redirect(ROUTES.login);

  const { id } = await params;
  const listing = await db.listing.findFirst({
    where: { id, providerId },
  });

  if (!listing) notFound();

  if (
    listing.status !== ListingStatus.PENDING &&
    listing.status !== ListingStatus.REJECTED
  ) {
    redirect(ROUTES.provider.listings);
  }

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
          İlanı düzenle
        </h1>
        <p className="mt-1 text-sm text-[#5a7a72]">
          Düzenleme sonrası ilan tekrar onaya gönderilir.
        </p>
      </div>

      {listing.rejectedReason ? (
        <div className="flex max-w-2xl items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-black text-red-900">Red nedeni</p>
            <p className="mt-1 text-sm text-red-800">{listing.rejectedReason}</p>
          </div>
        </div>
      ) : null}

      <div className="max-w-2xl rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <ListingForm
          listingId={listing.id}
          initial={{
            id: listing.id,
            categoryId: listing.categoryId,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            city: listing.city,
            district: listing.district,
            latitude: listing.latitude,
            longitude: listing.longitude,
            serviceRadiusKm: listing.serviceRadiusKm,
            rejectedReason: listing.rejectedReason,
          }}
        />
      </div>
    </div>
  );
}
