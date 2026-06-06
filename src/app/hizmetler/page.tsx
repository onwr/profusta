import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
} from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  formatProviderCategoryLabel,
  searchServicesCatalog,
} from "@/lib/search/services-catalog";

const howSteps = [
  {
    icon: Search,
    title: "Hizmet kategorisini seçin",
    text: "İhtiyacınıza en uygun ana kategoriyi bulun ve alt hizmetleri inceleyin.",
  },
  {
    icon: ClipboardList,
    title: "Talebinizi oluşturun",
    text: "Konum, açıklama ve detayları girerek birkaç dakikada hizmet talebi bırakın.",
  },
  {
    icon: MessageSquareText,
    title: "Ustalardan teklif alın",
    text: "Uygun ustalar talebinizi inceler, size fiyat ve süre bilgisiyle teklif sunar.",
  },
  {
    icon: CheckCircle2,
    title: "En uygun ustayı seçin",
    text: "Teklifleri karşılaştırın, profilleri inceleyin ve hizmet sürecini başlatın.",
  },
];

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Güvenilir süreç",
    text: "Talep, teklif ve usta seçimi daha kontrollü ilerler.",
  },
  {
    icon: MapPin,
    title: "Konuma göre hizmet",
    text: "Size yakın hizmet veren ustalara daha hızlı ulaşırsınız.",
  },
  {
    icon: Timer,
    title: "Zaman kazandırır",
    text: "Tek tek usta aramak yerine talebinize uygun teklifleri görürsünüz.",
  },
];

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const { query, categories, providers } = await searchServicesCatalog(
    params.q,
  );
  const hasQuery = Boolean(query);
  const hasResults = categories.length > 0 || providers.length > 0;

  return (
    <main className="min-h-screen bg-[#f6f7f2]">
      <section className="relative overflow-hidden bg-[#083228]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.45),transparent_34%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.12),transparent_28%)]" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-28 left-1/4 h-64 w-64 rounded-full bg-[#087a61]/25 blur-3xl" />

        <div className="relative mx-auto max-w-screen-2xl px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-black text-white/85 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                ProfUsta hizmet ağı
              </span>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                İhtiyacınız olan hizmeti kolayca bulun
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                Ev ve iş yeriniz için ihtiyaç duyduğunuz teknik hizmeti seçin,
                talebinizi oluşturun ve uygun ustalardan teklif alın.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={ROUTES.createRequest}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-[#083228] transition hover:bg-[#eef8f5]"
                >
                  Hemen Talep Oluştur
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#hizmet-kategorileri"
                  className="inline-flex h-12 items-center rounded-2xl border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Kategorileri İncele
                </a>
              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
              <div className="rounded-3xl bg-white p-5">
                <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#087a61]">
                      Hizmet akışı
                    </p>
                    <h2 className="mt-1 text-xl font-black text-[#083228]">
                      Nasıl ilerler?
                    </h2>
                  </div>

                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {howSteps.map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div key={step.title} className="flex gap-4">
                        <div className="relative">
                          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                            <Icon className="h-5 w-5" />
                          </div>

                          {index !== howSteps.length - 1 ? (
                            <div className="mx-auto mt-2 h-7 w-px bg-black/10" />
                          ) : null}
                        </div>

                        <div className="pb-2">
                          <p className="text-sm font-black text-[#083228]">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#66736f]">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {trustItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_55px_rgba(8,50,40,0.06)]"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-black text-[#083228]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#66736f]">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>

        <div
          id="hizmet-kategorileri"
          className="mt-14 flex flex-wrap items-end justify-between gap-5"
        >
          <div>
            <span className="inline-flex rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#087a61]">
              Hizmetler
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#083228] sm:text-4xl">
              {hasQuery ? `"${query}" için sonuçlar` : "Hizmet kategorileri"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736f]">
              {hasQuery
                ? hasResults
                  ? "Eşleşen kategorileri ve ustaları inceleyin veya yeni bir talep oluşturun."
                  : "Aramanızla eşleşen kategori veya usta bulunamadı. Farklı bir kelime deneyin veya doğrudan talep oluşturun."
                : "İhtiyacınıza en uygun kategoriyi seçin, alt hizmetleri inceleyin ve birkaç adımda talep oluşturun."}
            </p>
          </div>

          <Link
            href={ROUTES.createRequest}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#083228] px-5 text-sm font-black text-white transition hover:bg-[#087a61]"
          >
            Direkt Talep Oluştur
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {providers.length > 0 ? (
          <div className="mt-8">
            <h3 className="text-lg font-black text-[#083228]">Eşleşen ustalar</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`${ROUTES.providers}/${provider.slug ?? provider.id}`}
                  className="rounded-3xl border border-black/5 bg-white p-5 shadow-[0_18px_55px_rgba(8,50,40,0.06)] transition hover:border-[#087a61]/25"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                      <UserRound className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-black text-[#083228]">
                        {provider.fullName}
                      </p>
                      <p className="mt-1 text-xs text-[#66736f]">
                        {[provider.baseCity, provider.baseDistrict]
                          .filter(Boolean)
                          .join(", ") || "Konum belirtilmemiş"}
                      </p>
                      {provider.categories[0] ? (
                        <p className="mt-2 text-xs font-bold text-[#087a61]">
                          {formatProviderCategoryLabel(provider.categories[0])}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link
                href={`${ROUTES.providers}?q=${encodeURIComponent(query ?? "")}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#087a61] hover:underline"
              >
                Tüm ustaları gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}

        {categories.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon);
            const cover = cat.coverImageUrl;

            return (
              <Link
                key={cat.id}
                href={`${ROUTES.categories}/${cat.slug}`}
                className="group relative overflow-hidden rounded-[1.7rem] border border-black/5 bg-white shadow-[0_18px_55px_rgba(8,50,40,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#087a61]/25 hover:shadow-[0_24px_70px_rgba(8,50,40,0.11)]"
              >
                {cover ? (
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={cover}
                      alt=""
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                      unoptimized={cover.startsWith("http")}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#083228]/55 to-transparent" />
                    <div className="absolute bottom-3 left-4 grid h-11 w-11 place-items-center rounded-xl bg-white/95 text-[#087a61] shadow">
                      <Icon className="h-5 w-5 stroke-[1.7]" />
                    </div>
                  </div>
                ) : (
                  <div className="relative p-6 pb-0">
                    <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#eef8f5] transition group-hover:scale-125" />
                    <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61] transition group-hover:bg-[#087a61] group-hover:text-white">
                      <Icon className="h-7 w-7 stroke-[1.7]" />
                    </div>
                  </div>
                )}

                <div className={cover ? "relative p-5 pt-4" : "relative px-6 pb-6"}>
                  <h3
                    className={cn(
                      "text-lg font-black text-[#083228] transition group-hover:text-[#087a61]",
                      !cover && "mt-5",
                    )}
                  >
                    {cat.name}
                  </h3>

                  <p className="mt-2 line-clamp-3 min-h-[66px] text-sm leading-6 text-[#66736f]">
                    {cat.description ||
                      "Bu kategoriye ait hizmetleri inceleyebilir ve talep oluşturabilirsiniz."}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                    <p className="text-xs font-black text-[#087a61]">
                      {cat._count.services} alt hizmet
                    </p>

                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#083228] text-white transition group-hover:bg-[#087a61]">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        ) : hasQuery ? (
          <div className="mt-8 rounded-3xl border border-dashed border-black/10 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-[#66736f]">
              Kategori bulunamadı. Doğrudan talep oluşturarak ustalardan teklif
              alabilirsiniz.
            </p>
          </div>
        ) : null}

        <div className="mt-14 overflow-hidden rounded-4xl bg-[#083228] shadow-[0_24px_70px_rgba(8,50,40,0.14)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.5),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_25%)] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Hangi hizmete ihtiyacınız olduğunu bilmiyor musunuz?
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Sorununuzu kısaca anlatın. Uygun kategoriye göre talebinizi
                  oluşturup size en yakın ustalardan teklif alabilirsiniz.
                </p>
              </div>

              <Link
                href={ROUTES.createRequest}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-[#083228] transition hover:bg-[#eef8f5]"
              >
                Talep Oluştur
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}