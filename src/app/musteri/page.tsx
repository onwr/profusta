import { getCurrentUser } from "@/lib/auth/session";
import { getCustomerDashboardData } from "@/lib/customer/dashboard-data";
import { DashboardHero } from "@/components/customer/dashboard/dashboard-hero";
import { DashboardCategoryStrip } from "@/components/customer/dashboard/dashboard-category-strip";
import { DashboardRequestsWidget } from "@/components/customer/dashboard/dashboard-requests-widget";
import { DashboardOffersWidget } from "@/components/customer/dashboard/dashboard-offers-widget";
import { DashboardUpcomingWidget } from "@/components/customer/dashboard/dashboard-upcoming-widget";
import { DashboardNearbyMap } from "@/components/customer/dashboard/dashboard-nearby-map";
import { DashboardRecommendedProviders } from "@/components/customer/dashboard/dashboard-recommended-providers";
import { DashboardFavoritesWidget } from "@/components/customer/dashboard/dashboard-favorites-widget";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();
  const data = await getCustomerDashboardData(user!.id);

  return (
    <div className="space-y-6">
      <DashboardHero userName={user!.fullName} />

      <DashboardCategoryStrip categories={data.categories} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:items-stretch">
        <DashboardRequestsWidget
          fill
          className="xl:col-span-7 xl:row-start-1"
          requests={data.requests}
        />
        <DashboardNearbyMap
          fill
          className="xl:col-span-5 xl:row-start-1"
          centerLat={data.centerLat}
          centerLng={data.centerLng}
          providers={data.mapProviders}
          nearestProviderKm={data.nearestProviderKm}
          locationLabel={data.locationLabel}
        />
        <DashboardOffersWidget
          fill
          className="xl:col-span-7 xl:row-start-2"
          offers={data.recentOffers}
        />
        <DashboardUpcomingWidget
          fill
          className="xl:col-span-5 xl:row-start-2"
          orders={data.upcomingOrders}
        />
      </div>

      <DashboardRecommendedProviders providers={data.recommended} />

      <DashboardFavoritesWidget favorites={data.favorites} />
    </div>
  );
}
