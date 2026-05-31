import type { ListingStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = (searchParams.get("status") ?? "PENDING") as ListingStatus;

    const listings = await db.listing.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        provider: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        images: { take: 1, orderBy: { sortOrder: "asc" } },
      },
    });

    return jsonSuccess({ listings });
  } catch (err) {
    return handleApiError(err);
  }
}
