import { db } from "@/lib/db";
import { ProviderProToggle } from "@/components/admin/provider-pro-toggle";
import { AdminPageHeader } from "@/components/admin/admin-page-header";

export default async function AdminProvidersPage() {
  const providers = await db.provider.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { fullName: true, email: true, phone: true } },
      categories: true,
    },
    orderBy: { approvedAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Operasyon"
        title="Ustalar"
        subtitle={`${providers.length} onaylı usta`}
      />

      <div className="mt-6 space-y-3">
        {providers.map((p) => (
          <article
            key={p.id}
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-[#083228]">{p.user.fullName}</h3>
                  {p.isPro ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-black text-amber-700">
                      PRO USTA
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-[#53635f]">{p.user.email}</p>
              </div>
              <ProviderProToggle providerId={p.id} initialIsPro={p.isPro} />
            </div>
            <p className="mt-1 text-xs text-[#7b8b87]">
              {p.baseCity}
              {p.baseDistrict ? ` / ${p.baseDistrict}` : ""} ·{" "}
              {p.categories.map((c) => c.categorySlug).join(", ")}
            </p>
            {p.cancelCount >= 3 ? (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                Uyarı: {p.cancelCount} usta iptali
              </p>
            ) : p.cancelCount > 0 ? (
              <p className="mt-2 text-xs text-[#53635f]">
                İptal sayısı: {p.cancelCount}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
