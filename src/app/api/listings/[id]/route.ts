import { ListingStatus } from "@/generated/prisma/client";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const listing = await db.listing.findFirst({
      where: { id, status: ListingStatus.ACTIVE },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        provider: {
          include: {
            user: { select: { fullName: true } },
            categories: true,
          },
        },
      },
    });

    if (!listing) return jsonError("İlan bulunamadı", 404);

    return jsonSuccess({
      listing: {
        ...listing,
        provider: {
          id: listing.provider.id,
          fullName: listing.provider.user.fullName,
          bio: listing.provider.bio,
          baseCity: listing.provider.baseCity,
          ratingAvg: null,
          reviewCount: 0,
        },
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
