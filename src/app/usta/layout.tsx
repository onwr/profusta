import { redirect } from "next/navigation";
import { ProviderPanelShell } from "@/components/provider/provider-panel-shell";
import { getProviderNavCounts } from "@/lib/provider/dashboard-data";
import { getProviderSidebarProfile } from "@/lib/provider/sidebar-profile";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ProviderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || user.role !== "PROVIDER") {
    redirect("/giris?redirect=/usta");
  }
  if (user.provider?.status !== "APPROVED") {
    redirect("/usta-basvuru/beklemede");
  }

  const providerId = user.provider!.id;
  const [navCounts, profile] = await Promise.all([
    getProviderNavCounts(providerId, user.id),
    getProviderSidebarProfile(providerId, user.fullName),
  ]);

  return (
    <ProviderPanelShell
      userName={profile.fullName}
      avatarUrl={profile.avatarUrl}
      profession={profile.profession}
      ratingAvg={profile.ratingAvg}
      reviewCount={profile.reviewCount}
      navCounts={navCounts}
    >
      {children}
    </ProviderPanelShell>
  );
}
