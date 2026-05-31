import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { CategoryMediaCard } from "@/components/category/category-media-card";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { ButtonLink } from "@/components/ui/button";
import { getCategoryBySlug } from "@/lib/categories";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";

type Props = { params: Promise<{ slug: string }> };

const processSteps = [
  {
    icon: ClipboardList,
    title: "Alt hizmeti seçin",
    text: "İhtiyacınıza en yakın hizmet türünü seçerek talep sürecini başlatın.",
  },
  {
    icon: MessageSquareText,
    title: "Detayları paylaşın",
    text: "Adres, açıklama, görsel ve beklentilerinizi ekleyerek talebinizi netleştirin.",
  },
  {
    icon: CheckCircle2,
    title: "Teklifleri değerlendirin",
    text: "Ustalardan gelen teklifleri inceleyin ve size uygun olanı seçin.",
  },
];

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const CategoryIcon = getCategoryIcon(category.icon);

  return (
    <main className="min-h-screen bg-[#f6f7f2]">
      <section className="relative min-h-[280px] overflow-hidden bg-[#083228]">
        {category.coverImageUrl ? (
          <>
            <Image
              src={category.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              priority
              unoptimized={category.coverImageUrl.startsWith("http")}
            />
            <div className="absolute inset-0 bg-[#083228]/80" />
          </>
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.45),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_28%)]" />

        <div className="relative mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <Link
            href={ROUTES.categories}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-white/85 transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Tüm kategoriler
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80 ring-1 ring-white/15">
                <Sparkles className="h-3.5 w-3.5" />
                Hizmet kategorisi
              </span>

              <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {category.name}
              </h1>

              {category.description ? (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                  {category.description}
                </p>
              ) : (
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
                  Bu kategoriye ait alt hizmetleri inceleyin, ihtiyacınıza uygun
                  hizmeti seçin ve hızlıca talep oluşturun.
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink
                  href={`${ROUTES.createRequest}?kategori=${category.slug}`}
                  className="h-12 rounded-2xl bg-white px-6 text-sm font-black text-[#083228] hover:bg-[#eef8f5]"
                >
                  Talep Oluştur
                </ButtonLink>

                <a
                  href="#alt-hizmetler"
                  className="inline-flex h-12 items-center rounded-2xl border border-white/25 px-6 text-sm font-bold text-white transition hover:bg-white/10"
                >
                  Alt hizmetleri gör
                </a>
              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="rounded-3xl bg-white p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#083228]">
                      Kontrollü hizmet süreci
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#66736f]">
                      Talep oluşturun, teklifleri karşılaştırın ve size uygun
                      ustayla ilerleyin.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-[#f6f7f2] p-4">
                    <p className="text-2xl font-black text-[#083228]">
                      {category.services.length}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#66736f]">
                      Alt hizmet
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#eef8f5] p-4">
                    <p className="text-2xl font-black text-[#087a61]">3</p>
                    <p className="mt-1 text-xs font-semibold text-[#66736f]">
                      Adımda talep
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {processSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <article
                key={step.title}
                className="relative rounded-3xl border border-black/5 bg-white p-6 shadow-[0_18px_55px_rgba(8,50,40,0.06)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="text-xs font-black text-[#087a61]">
                    0{index + 1}
                  </span>
                </div>

                <h2 className="mt-5 font-black text-[#083228]">
                  {step.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#66736f]">
                  {step.text}
                </p>
              </article>
            );
          })}
        </div>

        <div
          id="alt-hizmetler"
          className="mt-14 flex flex-wrap items-end justify-between gap-5"
        >
          <div>
            <span className="inline-flex rounded-full bg-[#eef8f5] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#087a61]">
              Alt hizmetler
            </span>

            <h2 className="mt-3 text-3xl font-black tracking-tight text-[#083228] sm:text-4xl">
              {category.name} hizmetleri
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66736f]">
              İhtiyacınıza uygun alt hizmeti seçin. Seçtiğiniz hizmet talep
              formuna otomatik aktarılır.
            </p>
          </div>
        </div>

        {category.services.length === 0 ? (
          <div className="mt-8 rounded-4xl border border-dashed border-black/10 bg-white p-10 text-center shadow-sm">
            <h3 className="text-xl font-black text-[#083228]">
              Bu kategoriye ait hizmet eklenmemiş
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#66736f]">
              Yine de genel kategori üzerinden talep oluşturabilirsiniz.
            </p>

            <ButtonLink
              href={`${ROUTES.createRequest}?kategori=${category.slug}`}
              className="mt-5 h-11 rounded-2xl text-sm"
            >
              Talep Oluştur
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {category.services.map((svc) => (
              <div key={svc.id} className="flex flex-col">
                <CategoryMediaCard
                  href={`${ROUTES.createRequest}?kategori=${category.slug}&hizmet=${svc.slug}`}
                  title={svc.name}
                  description={
                    svc.description ??
                    "Bu hizmet için talep oluşturabilir, uygun ustalardan teklif alabilirsiniz."
                  }
                  coverImageUrl={category.coverImageUrl}
                  Icon={CategoryIcon}
                  badge={category.name}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 overflow-hidden rounded-4xl bg-[#083228] shadow-[0_24px_70px_rgba(8,50,40,0.14)]">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(8,122,97,0.5),transparent_34%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.12),transparent_25%)] p-8 sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-white">
                  Hemen {category.name} talebi oluşturun
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/72">
                  Kategori ve hizmet seçerek birkaç dakikada talebinizi
                  oluşturun. Uygun ustalardan teklif alın ve karşılaştırın.
                </p>
              </div>

              <ButtonLink
                href={`${ROUTES.createRequest}?kategori=${category.slug}`}
                variant="outline"
                className="h-12 rounded-2xl border-white/30 bg-white px-6 text-sm font-black text-[#083228] hover:bg-[#eef8f5]"
              >
                Talep Oluştur
                <ArrowRight className="ml-2 h-4 w-4" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}