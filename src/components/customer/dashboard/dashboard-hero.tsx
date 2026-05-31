import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export function DashboardHero({ userName }: { userName: string }) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] shadow-sm">
      <div className="relative grid min-h-[430px] lg:grid-cols-[1.2fr_0.8fr]">

        {/* SOL */}
        <div className="relative z-20 flex flex-col justify-center px-14 py-12">

          <p className="mb-4 text-sm font-semibold text-[#087a61]">
            Profesyonel Hizmet
          </p>

          <h1 className="max-w-[720px] text-6xl font-black leading-[1.05] tracking-[-2px] text-[#0b1f52]">
            İhtiyacın olan
            <br />
            ustaya hızlıca ulaş!
          </h1>

          <p className="mt-6 max-w-[700px] text-xl leading-9 text-[#64748b]">
            Binlerce uzman usta ile güvenli, hızlı ve
            profesyonel hizmet deneyimi yaşa.
          </p>

          <div className="mt-8 flex gap-4">

            <Link
              href={ROUTES.createRequest}
              className="rounded-2xl bg-[#087a61] px-8 py-4 font-bold text-white shadow-lg"
            >
              Yeni Talep Oluştur
            </Link>

            <Link
              href={ROUTES.categories}
              className="rounded-2xl border border-[#087a61]/10 bg-white px-8 py-4 font-bold text-[#087a61]"
            >
              Hizmetleri Keşfet
            </Link>

          </div>

          <div className="mt-12 flex gap-16">

            <Stat value="25K+" label="Aktif Usta" />
            <Stat value="100K+" label="Tamamlanan İş" />
            <Stat value="4.9★" label="Ortalama Puan" />

          </div>

        </div>

        {/* SAĞ */}

        <div className="relative overflow-hidden">

          <Image
            src="/herosag.png"
            alt="ProfUsta"
            fill
            priority
            className="
          object-contain
          object-right
          scale-[1.30]
          translate-x-10
        "
          />

          {/* geçiş */}
          <div className="
        absolute
        inset-0
        bg-gradient-to-r
        from-[#FBFDF5]
        via-[#FBFDF5]/40
        to-transparent
      "/>

        </div>

      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <h3 className="text-3xl font-black text-[#0b1f52]">{value}</h3>
      <p className="text-sm text-[#64748b]">{label}</p>
    </div>
  );
}