import { handleApiError, jsonSuccess } from "@/lib/api";
import { getActiveListings } from "@/lib/listings/query";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    const listings = await getActiveListings({
      categoryId: searchParams.get("categoryId") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      district: searchParams.get("district") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      sort:
        (searchParams.get("sort") as
          | "price_asc"
          | "price_desc"
          | "distance"
          | null) ?? undefined,
    });

    return jsonSuccess({ listings });
  } catch (err) {
    return handleApiError(err);
  }
}
