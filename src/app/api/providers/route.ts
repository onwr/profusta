import { ProviderStatus } from "@/generated/prisma/client";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { haversineKm, roundDistanceKm } from "@/lib/geo/haversine";
import { normalizeLocation } from "@/lib/geo/turkey";
import { getProviderRating } from "@/lib/reviews/aggregate";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const city = searchParams.get("city");
    const categorySlug = searchParams.get("categorySlug");
    const q = searchParams.get("q")?.trim();
    const sort = searchParams.get("sort") === "recent" ? "recent" : "distance";

    const latNum = lat ? Number(lat) : NaN;
    const lngNum = lng ? Number(lng) : NaN;
    const hasCoords = Number.isFinite(latNum) && Number.isFinite(lngNum);

    const providers = await db.provider.findMany({
      where: {
        status: ProviderStatus.APPROVED,
        ...(city
          ? { baseCity: { contains: city } }
          : {}),
        ...(categorySlug
          ? { categories: { some: { categorySlug } } }
          : {}),
        ...(q
          ? {
              OR: [
                { user: { fullName: { contains: q } } },
                { bio: { contains: q } },
                { baseCity: { contains: q } },
                { baseDistrict: { contains: q } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { fullName: true, avatarUrl: true } },
        categories: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const items = await Promise.all(
      providers.map(async (p) => {
        let distanceKm: number | null = null;

        if (hasCoords) {
          if (p.baseLatitude != null && p.baseLongitude != null) {
            distanceKm = roundDistanceKm(
              haversineKm(latNum, lngNum, p.baseLatitude, p.baseLongitude),
            );
          } else if (p.baseCity && city) {
            if (
              normalizeLocation(p.baseCity) === normalizeLocation(city)
            ) {
              distanceKm = 0;
            }
          }
        }

        const rating = await getProviderRating(p.id);

        return {
          id: p.id,
          slug: p.slug,
          fullName: p.user.fullName,
          avatarUrl: p.user.avatarUrl,
          bio: p.bio,
          baseCity: p.baseCity,
          baseDistrict: p.baseDistrict,
          categories: p.categories.map((c) => c.categorySlug),
          distanceKm,
          ...rating,
        };
      }),
    );

    if (sort === "distance" && hasCoords) {
      items.sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    }

    return jsonSuccess({ providers: items });
  } catch (err) {
    return handleApiError(err);
  }
}
