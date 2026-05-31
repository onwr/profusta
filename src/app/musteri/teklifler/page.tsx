import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ListChecks,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UsersRound,
  Zap,
} from "lucide-react";
import { OfferStatus, RequestStatus } from "@/generated/prisma/client";
import { OfferList } from "@/components/offers/offer-list";
import { panelClasses } from "@/components/panel/panel-theme";
import { getCurrentUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default async function CustomerOffersPage() {
  const user = await getCurrentUser();

  const selectedRequest = await db.serviceRequest.findFirst({
    where: {
      customerId: user!.id,
      status: RequestStatus.OPEN,
      offers: {
        some: {
          status: OfferStatus.PENDING,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      service: true,
      offers: { where: { status: OfferStatus.PENDING } },
      _count: { select: { offers: true } },
    },
  });

  const locationText = selectedRequest
    ? [
        selectedRequest.neighborhood,
        selectedRequest.district,
        selectedRequest.city,
      ]
        .filter(Boolean)
        .join(" / ")
    : "";

  const offerCount = selectedRequest?._count.offers ?? 0;

  return (
    <div className="space-y-5">
      <Link href={ROUTES.customer.requests} className={panelClasses.backLink}>
        <ArrowLeft className="h-4 w-4" />
        Taleplere Geri Dön
      </Link>

      {!selectedRequest ? (
        <section className={cn(panelClasses.emptyState, "p-12")}>
          <div
            className={cn(
              panelClasses.iconBox,
              "mx-auto h-14 w-14 rounded-2xl",
            )}
          >
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className={cn("mt-5", panelClasses.pageTitle)}>
            Bekleyen teklif yok
          </h1>
          <p className={cn("mx-auto mt-2 max-w-md leading-6", panelClasses.subtitle)}>
            Açık taleplerinize teklif geldiğinde karşılaştırma ekranı burada
            görünecek.
          </p>
          <Link
            href={ROUTES.createRequest}
            className={cn(panelClasses.primaryBtn, "mt-6 h-11 px-5")}
          >
            Yeni Talep Oluştur
          </Link>
        </section>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className={cn(panelClasses.card, "p-4")}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className={panelClasses.sectionTitle}>Talep Özeti</h2>
                <span className="rounded-full bg-[#eef8f5] px-2.5 py-1 text-[11px] font-bold text-[#087a61]">
                  Teklif Alındı
                </span>
              </div>
              <div className="flex gap-3">
                <div
                  className={cn(
                    panelClasses.iconBox,
                    "h-11 w-11 shrink-0 rounded-full",
                  )}
                >
                  <Zap className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className={panelClasses.cardTitle}>
                    {selectedRequest.category.name}
                  </p>
                  <p className={panelClasses.subtitle}>
                    {selectedRequest.service?.name ??
                      selectedRequest.category.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-xs text-[#5a7a72]">
                <SummaryRow
                  icon={<MapPin className="h-4 w-4" />}
                  text={locationText || "Konum belirtilmedi"}
                />
                <SummaryRow
                  icon={<Calendar className="h-4 w-4" />}
                  text={
                    selectedRequest.preferredDate
                      ? `${new Date(selectedRequest.preferredDate).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}${selectedRequest.preferredTime ? `, ${selectedRequest.preferredTime}` : ""}`
                      : "Tarih esnek"
                  }
                />
                <SummaryRow
                  icon={<Clock className="h-4 w-4" />}
                  text="Aciliyet Durumu"
                  badge="Acil"
                />
              </div>
              <Link
                href={`${ROUTES.customer.requests}/${selectedRequest.id}`}
                className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-sm font-bold text-[#087a61]"
              >
                Talep Detayını Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </section>

            <section className={cn(panelClasses.card, "p-4")}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className={panelClasses.sectionTitle}>Filtrele</h2>
                <button
                  className="text-xs font-bold text-[#087a61]"
                  type="button"
                >
                  Temizle
                </button>
              </div>
              <label className={panelClasses.sectionTitle}>Sırala</label>
              <div
                className={cn(
                  panelClasses.input,
                  "mt-2 px-3 py-2 text-xs text-[#5a7a72]",
                )}
              >
                Önerilen
              </div>
              <div className="mt-4">
                <p className={panelClasses.sectionTitle}>Fiyat Aralığı</p>
                <div className="mt-3 h-1 rounded-full bg-[#eef8f5]">
                  <div className="h-1 w-1/3 rounded-full bg-[#087a61]" />
                </div>
                <div className="mt-2 flex justify-between text-[11px] text-[#5a7a72]">
                  <span>200 TL</span>
                  <span>2.500 TL</span>
                </div>
              </div>
              <FilterCheckboxes />
            </section>
          </aside>

          <main className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className={panelClasses.pageTitle}>
                  Teklifleri Karşılaştır
                </h1>
                <p className={cn("mt-1", panelClasses.subtitle)}>
                  {selectedRequest.category.name} hizmeti için {offerCount}{" "}
                  ustadan teklif aldınız.
                </p>
              </div>
              <div className="text-right text-xs text-[#5a7a72]">
                <p>
                  Talep No:{" "}
                  <span className="font-black text-[#083228]">
                    #{selectedRequest.id.slice(-5)}
                  </span>
                </p>
                <p>
                  {new Date(selectedRequest.createdAt).toLocaleDateString(
                    "tr-TR",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            </div>

            <ProcessSteps />

            <OfferList
              requestId={selectedRequest.id}
              requestStatus={selectedRequest.status}
            />

            <div className="flex flex-wrap items-center gap-2 rounded-[16px] border border-[#087a61]/15 bg-[#eef8f5] px-4 py-3 text-xs text-[#5a7a72]">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#087a61]" />
              <span className="font-black text-[#083228]">
                Güvenliğiniz Bizim Önceliğimiz
              </span>
              <span>
                Ödemeniz sistemimizde güvence altındadır. Hizmet tamamlanmadan
                ustaya ödeme yapılmaz.
              </span>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  icon,
  text,
  badge,
}: {
  icon: React.ReactNode;
  text: string;
  badge?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#087a61]">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="leading-5">{text}</p>
        {badge ? (
          <span className="mt-1 inline-flex rounded bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
            {badge}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function FilterCheckboxes() {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <p className={panelClasses.sectionTitle}>Tahmini Süre</p>
        {["30 dk altı", "30 dk - 1 saat", "1 - 2 saat", "2 saat+"].map(
          (item) => (
            <label
              key={item}
              className="mt-2 flex items-center gap-2 text-xs text-[#5a7a72]"
            >
              <span className="h-4 w-4 rounded border border-black/10" />
              {item}
            </label>
          ),
        )}
      </div>
      <div>
        <p className={panelClasses.sectionTitle}>Usta Puanı</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["4+", "4.5+", "5"].map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                panelClasses.ghostBtn,
                "h-8 justify-center gap-1 text-[#5a7a72]",
              )}
            >
              <Star className="h-3 w-3 fill-[#f5b326] text-[#f5b326]" />
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessSteps() {
  const steps = [
    {
      title: "Teklifleri karşılaştır",
      text: "Fiyat, süre ve puanları inceleyin",
      icon: ListChecks,
    },
    {
      title: "Ustanızı seçin",
      text: "Size en uygun teklifi seçin",
      icon: UsersRound,
    },
    {
      title: "Güvenli ödeme yapın",
      text: "Ödemeniz sistemimizde güvende",
      icon: CreditCard,
    },
    {
      title: "Hizmetinizi alın",
      text: "Ustanız işini tamamlasın",
      icon: CheckCircle2,
    },
  ];

  return (
    <div
      className={cn(
        panelClasses.card,
        "grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4",
      )}
    >
      {steps.map((step) => (
        <div key={step.title} className="flex items-center gap-3">
          <div className={cn(panelClasses.iconBox, "h-9 w-9 shrink-0")}>
            <step.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-[#083228]">{step.title}</p>
            <p className="mt-0.5 text-[11px] text-[#5a7a72]">{step.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
