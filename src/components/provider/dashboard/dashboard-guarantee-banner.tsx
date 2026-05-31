import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";

export function DashboardGuaranteeBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#087a61]/15 bg-white shadow-[0_18px_50px_rgba(8,50,40,0.06)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.12),transparent_34%),linear-gradient(135deg,#ffffff_0%,#eef8f5_100%)]" />

      <div className="relative z-10 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61] shadow-[0_12px_28px_rgba(8,122,97,0.14)] ring-1 ring-[#087a61]/10">
            <ShieldCheck className="h-7 w-7" />
            <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-[#087a61] text-white">
              <BadgeCheck className="h-3.5 w-3.5" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#eef8f5] px-2.5 py-1 text-[10.5px] font-black uppercase tracking-[0.12em] text-[#087a61]">
              <Sparkles className="h-3 w-3" />
              Güven Rozeti Aktif
            </div>

            <h3 className="text-[18px] font-black tracking-[-0.03em] text-[#083228]">
              ProfUsta Güvencesi ile daha fazla müşteri kazan
            </h3>

            <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-6 text-[#5a7a72]">
              Onaylı usta profilin müşterilerde güven oluşturur. Hizmet
              bölgelerini, uzmanlıklarını ve profil bilgilerini güncel tutarak
              teklif dönüşlerini artırabilirsin.
            </p>
          </div>
        </div>

        <Link
          href={ROUTES.provider.profile}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#087a61] px-5 text-[13px] font-black text-white shadow-[0_14px_30px_rgba(8,122,97,0.22)] transition hover:brightness-95"
        >
          Profilimi Güçlendir
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
