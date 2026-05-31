import { ListingStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const existing = await db.listing.findFirst({
      where: { id, providerId: provider.id, status: ListingStatus.ACTIVE },
    });
    if (!existing) return jsonError("İlan bulunamadı", 404);

    const listing = await db.listing.update({
      where: { id },
      data: { status: ListingStatus.INACTIVE },
    });

    return jsonSuccess({ listing });
  } catch (err) {
    return handleApiError(err);
  }
}
