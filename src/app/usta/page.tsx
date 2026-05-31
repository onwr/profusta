import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { getProviderDashboardData } from "@/lib/provider/dashboard-data";
import {
  getDashboardRangeBounds,
  parseDashboardRange,
} from "@/lib/provider/dashboard-range";
import { DashboardWelcomeHeader } from "@/components/provider/dashboard/dashboard-welcome-header";
import { DashboardStatRow } from "@/components/provider/dashboard/dashboard-stat-row";
import { DashboardEarningsChart } from "@/components/provider/dashboard/dashboard-earnings-chart";
import { DashboardJobDonut } from "@/components/provider/dashboard/dashboard-job-donut";
import { DashboardIncomingRequests } from "@/components/provider/dashboard/dashboard-incoming-requests";
import { DashboardActiveJobs } from "@/components/provider/dashboard/dashboard-active-jobs";
import { DashboardWalletCard } from "@/components/provider/dashboard/dashboard-wallet-card";
import { DashboardAppointments } from "@/components/provider/dashboard/dashboard-appointments";
import { DashboardPerformance } from "@/components/provider/dashboard/dashboard-performance";
import { DashboardGuaranteeBanner } from "@/components/provider/dashboard/dashboard-guarantee-banner";

export const dynamic = "force-dynamic";

export default async function ProviderDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const user = await getCurrentUser();
  const provider = user!.provider!;
  const params = await searchParams;
  const range = parseDashboardRange(params.range);
  const bounds = getDashboardRangeBounds(range);

  const data = await getProviderDashboardData(
    provider.id,
    user!.id,
    user!.fullName,
    range,
  );

  const firstName = data.fullName.split(" ")[0];

  return (
    <div className="space-y-5">
      <Suspense
        fallback={
          <div className="h-16 animate-pulse rounded-xl bg-[#e8ecf1]" />
        }
      >
        <DashboardWelcomeHeader
          firstName={firstName}
          profession={data.profession}
          ratingAvg={data.ratingAvg}
          stats={data.stats}
          welcome={data.welcome}
        />
      </Suspense>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardEarningsChart
              data={data.earningsByDay}
              earningsTitle={bounds.earningsTitle}
              summary={data.welcome}
              prevPeriodLabel={bounds.prevPeriodLabel}
              comparisonHint={bounds.comparisonHint}
            />
            <DashboardJobDonut distribution={data.jobDistribution} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardIncomingRequests requests={data.incomingRequests} />
            <DashboardActiveJobs jobs={data.activeJobs} />
          </div>

          <DashboardGuaranteeBanner />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <DashboardWalletCard wallet={data.wallet} />
          <DashboardAppointments appointments={data.appointments} />
          <DashboardPerformance performance={data.performance} />
        </div>
      </div>
    </div>
  );
}
