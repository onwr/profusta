"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  MessageSquareText,
  Sparkles,
  Star,
} from "lucide-react";

type Review = {
  id: string;
  rating: number;
  comment: string;
  orderTitle: string;
  authorName: string;
  createdAt: string;
};

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews ?? []);
        setLoading(false);
      });
  }, []);

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[32px] border border-black/5 bg-[#FBFDF5] p-7 shadow-sm lg:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#087a61]/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#087a61] shadow-sm">
            <MessageSquareText className="h-4 w-4" />
            Değerlendirmeler
          </div>

          <h1 className="text-[34px] font-black leading-tight tracking-[-0.04em] text-[#083228] md:text-[44px]">
            Yorumlarım
          </h1>

          <p className="mt-3 max-w-[560px] text-base leading-7 text-[#53635f]">
            Tamamlanan hizmetler sonrası verdiğiniz yorum ve puanları buradan
            görüntüleyebilirsiniz.
          </p>
        </div>

        <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Toplam Yorum" value={loading ? "..." : reviews.length} />
          <StatCard label="Ortalama Puan" value={loading ? "..." : average ? average.toFixed(1) : "0.0"} />
          <StatCard label="En Yüksek Puan" value="5.0" />
        </div>
      </section>

      <section className="rounded-[28px] border border-black/5 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-6">
          <h2 className="text-xl font-black text-[#083228]">
            Değerlendirme Listesi
          </h2>
          <p className="mt-1 text-sm text-[#53635f]">
            Hizmet geçmişinizdeki yorumlarınız.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center rounded-[28px] bg-[#FBFDF5]">
            <div className="flex flex-col items-center gap-3 text-sm font-medium text-[#53635f]">
              <Loader2 className="h-8 w-8 animate-spin text-[#087a61]" />
              Yorumlar yükleniyor...
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#087a61]/25 bg-[#FBFDF5] p-10 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#eef8f5] text-[#087a61]">
              <Sparkles className="h-8 w-8" />
            </div>

            <h3 className="mt-5 text-xl font-black text-[#083228]">
              Henüz yorum yok
            </h3>

            <p className="mx-auto mt-3 max-w-[420px] text-sm leading-6 text-[#53635f]">
              Tamamlanan hizmetlerden sonra yaptığınız değerlendirmeler burada
              görünecek.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[26px] border border-black/5 bg-[#FBFDF5] p-5 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_38px_rgba(8,50,40,0.07)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-[#083228]">
                      {review.orderTitle}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-[#53635f]">
                      {review.authorName}
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#7b8b87]">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 rounded-full bg-white px-4 py-2 shadow-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-[#083228]">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                <p className="mt-4 rounded-[20px] bg-white p-4 text-sm leading-7 text-[#53635f]">
                  {review.comment || "Yorum metni eklenmemiş."}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef8f5] text-[#087a61]">
          <Star className="h-5 w-5" />
        </div>

        <div>
          <p className="text-2xl font-black text-[#083228]">{value}</p>
          <p className="mt-0.5 text-sm font-medium text-[#53635f]">{label}</p>
        </div>
      </div>
    </div>
  );
}