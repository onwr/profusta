import { ListingStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";
import { saveListingImages } from "@/lib/upload";
import { assertServiceAreaEnabled } from "@/lib/settings/service-areas";
import { createListingSchema } from "@/lib/validations/listing";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonSuccess({ listings: [] });

    const listings = await db.listing.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true, slug: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { images: true } },
      },
    });

    const serialized = listings.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      city: l.city,
      district: l.district,
      status: l.status,
      rejectedReason: l.rejectedReason,
      serviceRadiusKm: l.serviceRadiusKm,
      createdAt: l.createdAt.toISOString(),
      approvedAt: l.approvedAt?.toISOString() ?? null,
      category: l.category,
      imageUrl: l.images[0]?.url ?? null,
      imageCount: l._count.images,
    }));

    return jsonSuccess({ listings: serialized });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const form = await request.formData();
    const rawData = form.get("data");
    if (typeof rawData !== "string") {
      return jsonError("Geçersiz form verisi", 400);
    }

    const data = createListingSchema.parse(JSON.parse(rawData));
    const category = await db.category.findFirst({
      where: { id: data.categoryId, isActive: true },
    });
    if (!category) return jsonError("Kategori bulunamadı", 404);

    const areaCheck = await assertServiceAreaEnabled(data.city, data.district);
    if (!areaCheck.ok) {
      return jsonError(areaCheck.message, 400);
    }

    const listing = await db.listing.create({
      data: {
        providerId: provider.id,
        categoryId: category.id,
        title: data.title.trim(),
        description: data.description.trim(),
        price: data.price,
        city: data.city.trim(),
        district: data.district?.trim() || null,
        latitude: data.latitude,
        longitude: data.longitude,
        serviceRadiusKm: data.serviceRadiusKm ?? 20,
        status: ListingStatus.PENDING,
      },
    });

    const imageFiles = form
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    try {
      const urls = await saveListingImages(listing.id, imageFiles);
      if (urls.length > 0) {
        await db.listingImage.createMany({
          data: urls.map((url, i) => ({
            listingId: listing.id,
            url,
            sortOrder: i,
          })),
        });
      }
    } catch (uploadErr) {
      await db.listing.delete({ where: { id: listing.id } });
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Yükleme hatası";
      return jsonError(message, 400);
    }

    return jsonSuccess(
      {
        listing,
        message: "İlanınız admin onayına gönderildi",
      },
      201,
    );
  } catch (err) {
    return handleApiError(err);
  }
}
