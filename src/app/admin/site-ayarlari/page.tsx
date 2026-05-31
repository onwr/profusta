import { CouponAdminForm } from "@/components/admin/coupon-admin-form";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings/site";

export const dynamic = "force-dynamic";

export default async function AdminSiteSettingsPage() {
  const [settings, coupons] = await Promise.all([
    getSiteSettings(),
    db.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ayarlar"
        title="Site ayarları"
        subtitle="Genel platform ayarları ve kupon yönetimi"
      />
      <div className="mt-8">
        <SiteSettingsForm initial={settings} />
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-bold text-[#083228]">Kuponlar</h2>
        <CouponAdminForm />
        <ul className="mt-4 space-y-2">
          {coupons.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-black/5 bg-white px-4 py-3 text-sm"
            >
              <span className="font-bold">{c.code}</span> —{" "}
              {c.discountType === "PERCENT"
                ? `%${c.discountValue}`
                : `${c.discountValue} ₺`}{" "}
              · {c.isActive ? "Aktif" : "Pasif"} · Kullanım: {c.usedCount}
              {c.maxUses != null ? `/${c.maxUses}` : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
