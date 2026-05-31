import { ListingStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";
import { saveListingImages } from "@/lib/upload";
import { assertServiceAreaEnabled } from "@/lib/settings/service-areas";
import { updateListingSchema } from "@/lib/validations/listing";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const listing = await db.listing.findFirst({
      where: { id, providerId: provider.id },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!listing) return jsonError("İlan bulunamadı", 404);
    return jsonSuccess({ listing });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const existing = await db.listing.findFirst({
      where: { id, providerId: provider.id },
    });
    if (!existing) return jsonError("İlan bulunamadı", 404);

    if (
      existing.status !== ListingStatus.PENDING &&
      existing.status !== ListingStatus.REJECTED
    ) {
      return jsonError("Bu ilan düzenlenemez", 400);
    }

    const form = await request.formData();
    const rawData = form.get("data");
    if (typeof rawData !== "string") {
      return jsonError("Geçersiz form verisi", 400);
    }

    const data = updateListingSchema.parse(JSON.parse(rawData));

    const areaCheck = await assertServiceAreaEnabled(data.city, data.district);
    if (!areaCheck.ok) {
      return jsonError(areaCheck.message, 400);
    }

    const listing = await db.listing.update({
      where: { id },
      data: {
        categoryId: data.categoryId,
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price,
        city: data.city.trim(),
        district: data.district?.trim() || null,
        latitude: data.latitude,
        longitude: data.longitude,
        serviceRadiusKm: data.serviceRadiusKm ?? 20,
        status: ListingStatus.PENDING,
        rejectedReason: null,
      },
    });

    const imageFiles = form
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    if (imageFiles.length > 0) {
      const urls = await saveListingImages(listing.id, imageFiles);
      await db.listingImage.deleteMany({ where: { listingId: listing.id } });
      await db.listingImage.createMany({
        data: urls.map((url, i) => ({
          listingId: listing.id,
          url,
          sortOrder: i,
        })),
      });
    }

    return jsonSuccess({ listing });
  } catch (err) {
    return handleApiError(err);
  }
}
