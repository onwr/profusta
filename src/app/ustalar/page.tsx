import { Suspense } from "react";
import { BadgeCheck, Sparkles } from "lucide-react";
import { ProvidersList } from "@/components/providers/providers-list";

export default function ProvidersListPage() {
  return (
    <div className="min-h-screen bg-[#f7f7f3]">
      <div className="relative overflow-hidden bg-linear-to-b from-[#06291f] via-[#07372b] to-[#041b15]">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-[#0b8067]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-6 py-12 sm:px-10 sm:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white ring-1 ring-white/15">
            <Sparkles className="h-3.5 w-3.5" />
            ProfUsta güvencesiyle
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Ustalar
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            Bölgenizdeki onaylı hizmet sağlayıcıları keşfedin; puanları,
            uzmanlık alanları ve mesafeleriyle karşılaştırın.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/15 px-3 py-1.5 text-xs font-bold text-[#36E4C2]">
            <BadgeCheck className="h-4 w-4" />
            Tüm ustalar kimlik ve hizmet onayından geçer
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10 sm:py-10">
        <Suspense
          fallback={
            <p className="text-sm text-[#53635f]">Yükleniyor...</p>
          }
        >
          <ProvidersList />
        </Suspense>
      </div>
    </div>
  );
}
