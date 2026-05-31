import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Clock,
  ImageIcon,
  MapPin,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { ReadonlyLocationMap } from "@/components/geo/readonly-location-map";
import { CancelRequestButton } from "@/components/customer/cancel-request-button";
import { OfferList } from "@/components/offers/offer-list";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";

type Props = { params: Promise<{ id: string }> };

const statusLabels: Record<string, string> = {
  OPEN: "Açık",
  OFFER_ACCEPTED: "Teklif kabul edildi",
  CANCELLED: "İptal",
};

const statusStyles: Record<string, string> = {
  OPEN: "bg-[#eef8f5] text-[#087a61]",
  OFFER_ACCEPTED: "bg-[#dcf7e7] text-[#066b54]",
  CANCELLED: "bg-red-50 text-red-600",
};

export default async function CustomerRequestDetailPage({ params }: Props) {
  const user = await getCurrentUser();
  const { id } = await params;

  const request = await db.serviceRequest.findFirst({
    where: { id, customerId: user!.id },
    include: {
      category: true,
      service: true,
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { matches: true } },
    },
  });

  if (!request) notFound();

  const locationText = [
    request.city,
    request.district,
    request.neighborhood,
  ]
    .filter(Boolean)
    .join(" / ");

  return (
    <div className="space-y-8">
      <Link
        href={ROUTES.customer.requests}
        className="inline-flex items-center gap-2 text-sm font-black text-[#087a61] transition hover:text-[#06644f]"
      >
        <ArrowLeft className="h-4 w-4" />
        Taleplerime Dön
      </Link>

      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />
        <div className="absolute right-20 bottom-0 h-40 w-40 rounded-full bg-[#099fd8]/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
              <ClipboardList className="h-4 w-4" />
              Talep Detayı
            </div>

            <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
              {request.category.name}
            </h1>

            {request.service ? (
              <p className="mt-2 text-base font-medium text-[#53635f]">
                {request.service.name}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-medium text-[#53635f]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                <MapPin className="h-4 w-4 text-[#087a61]" />
                {locationText || "Konum belirtilmedi"}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-sm">
                <Calendar className="h-4 w-4 text-[#087a61]" />
                {new Date(request.createdAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <StatusBadge status={request.status} />

            {request.status === "OPEN" ? (
              <CancelRequestButton requestId={request.id} />
            ) : null}
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-3">
          <InfoStat
            icon={<UsersRound className="h-5 w-5" />}
            value={request._count.matches}
            label="Usta eşleşti"
          />
          <InfoStat
            icon={<ImageIcon className="h-5 w-5" />}
            value={request.images.length}
            label="Fotoğraf eklendi"
          />
          <InfoStat
            icon={<Clock className="h-5 w-5" />}
            value={
              request.preferredDate
                ? new Date(request.preferredDate).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "short",
                  })
                : "Esnek"
            }
            label={
              request.preferredTime
                ? `Tercih: ${request.preferredTime}`
                : "Tercih edilen tarih"
            }
          />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-[#083228]">
                  Talep Açıklaması
                </h2>
                <p className="mt-1 text-sm text-[#53635f]">
                  Müşteri tarafından girilen hizmet detayı
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#FBFDF5] p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-[#53635f]">
                {request.description || "Açıklama eklenmemiş."}
              </p>
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-black text-[#083228]">
                Gelen Teklifler
              </h2>
              <p className="mt-1 text-sm text-[#53635f]">
                Ustalardan gelen teklifleri karşılaştırın.
              </p>
            </div>

            <OfferList requestId={request.id} requestStatus={request.status} />
          </section>

          {request.images.length > 0 ? (
            <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black text-[#083228]">
                  Fotoğraflar
                </h2>
                <p className="mt-1 text-sm text-[#53635f]">
                  Talebe eklenen görseller
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {request.images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-video overflow-hidden rounded-[22px] bg-[#f4f7f6]"
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      className="object-cover transition duration-500 hover:scale-105"
                      sizes="420px"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black text-[#083228]">
              Konum Bilgisi
            </h2>

            <div className="mt-5 overflow-hidden rounded-[24px] border border-black/5 bg-[#FBFDF5] p-2">
              <ReadonlyLocationMap
                latitude={request.latitude}
                longitude={request.longitude}
              />
            </div>

            <div className="mt-5 space-y-4">
              <DetailRow
                label="Konum"
                value={locationText || "Belirtilmedi"}
              />

              {request.addressDetail ? (
                <DetailRow label="Adres" value={request.addressDetail} />
              ) : null}
            </div>
          </section>

          <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex gap-4">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                <Sparkles className="h-7 w-7" />
              </div>

              <div>
                <h3 className="font-black text-[#083228]">
                  Teklifleri Karşılaştırın
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#53635f]">
                  Fiyat, puan ve açıklamaları inceleyerek size en uygun ustayı
                  seçebilirsiniz.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={[
        "inline-flex rounded-full px-4 py-2 text-sm font-black shadow-sm",
        statusStyles[status] ?? "bg-[#f0f4f2] text-[#5a7a72]",
      ].join(" ")}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}

function InfoStat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: React.ReactNode;
  label: string;
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-[#FBFDF5] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-[#087a61]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-[#53635f]">{value}</p>
    </div>
  );
}