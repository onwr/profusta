import { redirect } from "next/navigation";
import { CustomerPanelShell } from "@/components/customer/customer-panel-shell";
import { getCustomerNavCounts } from "@/lib/customer/dashboard-data";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "CUSTOMER" && user.role !== "ADMIN")) {
    redirect("/giris?redirect=/musteri");
  }

  const navCounts = await getCustomerNavCounts(user.id);

  return (
    <CustomerPanelShell
      userId={user.id}
      userName={user.fullName}
      navCounts={navCounts}
    >
      {children}
    </CustomerPanelShell>
  );
}
