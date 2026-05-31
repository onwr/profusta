import Link from "next/link";
import { ListingAdminTable } from "@/components/admin/listing-admin-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ListingStatus } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminListingsPage({ searchParams }: Props) {
  const { status: statusParam } = await searchParams;
  const status = (statusParam ?? "PENDING") as ListingStatus;

  const listings = await db.listing.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      provider: {
        include: { user: { select: { fullName: true, email: true } } },
      },
    },
  });

  const tabs: { label: string; value: ListingStatus }[] = [
    { label: "Onay bekleyen", value: ListingStatus.PENDING },
    { label: "Yayında", value: ListingStatus.ACTIVE },
    { label: "Reddedilen", value: ListingStatus.REJECTED },
    { label: "Pasif", value: ListingStatus.INACTIVE },
  ];

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="İlanlar"
        subtitle="İlan onay ve yönetimi"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`${ROUTES.admin.listings}?status=${tab.value}`}
            className={[
              "rounded-full px-4 py-2 text-sm font-semibold transition",
              status === tab.value
                ? "bg-[#087a61] text-white"
                : "bg-white text-[#083228] hover:bg-[#eef8f5]",
            ].join(" ")}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <ListingAdminTable
          listings={listings.map((l) => ({
            ...l,
            createdAt: l.createdAt.toISOString(),
          }))}
        />
      </div>
    </div>
  );
}
