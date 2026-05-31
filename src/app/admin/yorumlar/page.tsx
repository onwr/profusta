import { ReviewAdminTable } from "@/components/admin/review-admin-table";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      customer: { select: { fullName: true } },
      provider: {
        include: { user: { select: { fullName: true } } },
      },
      order: { select: { title: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="İçerik"
        title="Yorum moderasyonu"
        subtitle="Müşteri değerlendirmelerini inceleyin ve yönetin"
      />
      <div className="mt-8">
        <ReviewAdminTable reviews={reviews} />
      </div>
    </div>
  );
}
