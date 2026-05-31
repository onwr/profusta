import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/giris?redirect=/admin");
  }

  return (
    <div className="flex min-h-dvh bg-[#f7f7f3]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-black/5 bg-white/80 px-6 backdrop-blur lg:px-10">
          <span className="text-[13px] font-bold text-[#53635f]">
            Yönetim Paneli
          </span>
          <div className="flex items-center gap-3">
            <NotificationBell buttonClassName="relative grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-[#083228] transition hover:bg-[#eef8f5]" />
            <span className="hidden text-[13px] font-semibold text-[#083228] sm:inline">
              {user.email}
            </span>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d7e5e1] px-3 py-1.5 text-xs font-bold text-[#087a61] transition hover:bg-[#eef8f5]"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Siteye Dön
            </Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
