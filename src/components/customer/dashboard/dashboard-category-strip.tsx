import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { CategoryCoverThumb } from "@/components/category/category-cover-thumb";
import { getCategoryIcon } from "@/lib/category-icons";
import { ROUTES } from "@/lib/constants";

type Category = {
  id: string;
  slug: string;
  name: string;
  icon: string | null;
  coverImageUrl?: string | null;
};

export function DashboardCategoryStrip({
  categories,
}: {
  categories: Category[];
}) {
  const display = categories.slice(0, 7);

  return (
    <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[#083228]">
            Popüler Hizmet Kategorileri
          </h2>

          <p className="mt-1 text-sm text-[#7b8b87]">
            İhtiyacınıza uygun hizmet kategorisini seçin.
          </p>
        </div>

        <Link
          href={ROUTES.categories}
          className="
          hidden
          items-center
          gap-2
          rounded-full
          bg-[#f6faf8]
          px-4
          py-2
          text-sm
          font-bold
          text-[#087a61]
          transition
          hover:bg-[#eef8f5]
          md:flex
          "
        >
          Tümünü Gör
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KATEGORİLER */}

      <div className="grid grid-cols-4 gap-4 lg:grid-cols-8">

        {display.map((category) => {
          const Icon = getCategoryIcon(category.icon);

          return (
            <Link
              key={category.id}
              href={`${ROUTES.createRequest}?category=${category.slug}`}
              className="
              group
              rounded-2xl
              border
              border-black/5
              bg-[#FBFDF5]
              p-4
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#087a61]/15
              hover:shadow-lg
              "
            >
              <CategoryCoverThumb
                coverImageUrl={category.coverImageUrl}
                Icon={Icon}
                name={category.name}
                size="md"
                className="mx-auto transition group-hover:ring-2 group-hover:ring-[#087a61]/25"
              />

              <p
                className="
                mt-3
                line-clamp-2
                text-center
                text-xs
                font-bold
                leading-5
                text-[#083228]
                "
              >
                {category.name}
              </p>
            </Link>
          );
        })}

        {/* TÜMÜ */}

        <Link
          href={ROUTES.categories}
          className="
          group
          rounded-2xl
          border
          border-dashed
          border-[#087a61]/20
          bg-[#f8fbfa]
          p-4
          transition
          hover:bg-[#eef8f5]
          "
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
            <LayoutGrid className="h-7 w-7 text-[#087a61]" />
          </div>

          <p className="mt-3 text-center text-xs font-bold text-[#083228]">
            Tümü
          </p>
        </Link>

      </div>
    </section>
  );
}