import { OrderSourceType } from "@/generated/prisma/client";
import { Calendar, Clock, Shield } from "lucide-react";

type PrivateOfferSource = {
  title: string;
  price: number;
  description: string;
  scheduledAt: Date | null;
  durationHours: number | null;
  warrantyNote: string | null;
  status: string;
};

type Props = {
  sourceType: OrderSourceType;
  privateOffer?: PrivateOfferSource | null;
  listingTitle?: string | null;
  requestCategory?: string | null;
};

export function OrderSourceCard({
  sourceType,
  privateOffer,
  listingTitle,
  requestCategory,
}: Props) {
  if (sourceType === OrderSourceType.PRIVATE_OFFER && privateOffer) {
    return (
      <div className="mt-6 rounded-2xl border border-[#087a61]/20 bg-[#eef8f5] p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-[#087a61]">
          Özel teklif kaynağı
        </p>
        <p className="mt-2 text-lg font-black text-[#083228]">{privateOffer.title}</p>
        <p className="mt-1 text-2xl font-black text-[#087a61]">
          {privateOffer.price.toLocaleString("tr-TR")} ₺
        </p>
        <p className="mt-3 whitespace-pre-wrap text-sm text-[#083228]">
          {privateOffer.description}
        </p>
        <div className="mt-4 space-y-2 text-xs text-[#53635f]">
          {privateOffer.scheduledAt ? (
            <p className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-[#087a61]" />
              {privateOffer.scheduledAt.toLocaleString("tr-TR", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          ) : null}
          {privateOffer.durationHours ? (
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-[#087a61]" />
              Tahmini süre: {privateOffer.durationHours} saat
            </p>
          ) : null}
          {privateOffer.warrantyNote ? (
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#087a61]" />
              {privateOffer.warrantyNote}
            </p>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-[#7b8b87]">
          Teklif durumu: {privateOffer.status}
        </p>
      </div>
    );
  }

  if (sourceType === OrderSourceType.LISTING && listingTitle) {
    return (
      <p className="mt-4 text-sm text-[#53635f]">
        Kaynak: İlan — <span className="font-semibold">{listingTitle}</span>
      </p>
    );
  }

  if (sourceType === OrderSourceType.REQUEST_OFFER && requestCategory) {
    return (
      <p className="mt-4 text-sm text-[#53635f]">
        Kaynak: Talep teklifi —{" "}
        <span className="font-semibold">{requestCategory}</span>
      </p>
    );
  }

  return null;
}
