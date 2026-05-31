import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Plus,
  XCircle,
} from "lucide-react";
import { CustomerRequestsList } from "@/components/customer/customer-requests-list";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

export default async function CustomerRequestsPage() {
  const user = await getCurrentUser();

  const requests = await db.serviceRequest.findMany({
    where: { customerId: user!.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      service: { select: { name: true } },
      _count: { select: { matches: true } },
    },
  });

  const rows = requests.map((r) => ({
    id: r.id,
    status: r.status,
    city: r.city,
    district: r.district,
    createdAt: r.createdAt.toISOString(),
    categoryName: r.category.name,
    serviceName: r.service?.name ?? null,
    matchCount: r._count.matches,
  }));

  const openCount = requests.filter((r) => r.status === "OPEN").length;
  const acceptedCount = requests.filter(
    (r) => r.status === "OFFER_ACCEPTED",
  ).length;
  const cancelledCount = requests.filter((r) => r.status === "CANCELLED").length;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />
        <div className="absolute bottom-0 right-20 h-40 w-40 rounded-full bg-[#099fd8]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
              <ClipboardList className="h-4 w-4" />
              Müşteri Talepleri
            </div>

            <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
              Hizmet Taleplerim
            </h1>

            <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53635f]">
              Oluşturduğunuz tüm hizmet taleplerini, gelen teklifleri ve talep
              durumlarını buradan takip edebilirsiniz.
            </p>
          </div>

          <Link
            href={ROUTES.createRequest}
            className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-7 py-4 text-sm font-black text-white shadow-[0_14px_30px_rgba(8,122,97,0.18)] transition hover:bg-[#06644f]"
          >
            <Plus className="h-4 w-4" />
            Yeni Talep Oluştur
          </Link>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Açık Talepler"
            value={openCount}
          />
          <StatCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Kabul Edilen"
            value={acceptedCount}
          />
          <StatCard
            icon={<XCircle className="h-5 w-5" />}
            label="İptal Edilen"
            value={cancelledCount}
          />
        </div>
      </section>

      <CustomerRequestsList requests={rows} />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-black text-[#083228]">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-[#53635f]">{label}</p>
        </div>
      </div>
    </div>
  );
}
