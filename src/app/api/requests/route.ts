import { NotificationType, ProviderStatus, RequestStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { haversineKm, roundDistanceKm } from "@/lib/geo/haversine";
import { matchProvidersForRequest } from "@/lib/geo/match-providers";
import { saveRequestImages } from "@/lib/upload";
import { assertServiceAreaEnabled } from "@/lib/settings/service-areas";
import { createRequestSchema } from "@/lib/validations/request";
import { ROUTES } from "@/lib/constants";

export async function GET() {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const requests = await db.serviceRequest.findMany({
      where: { customerId: user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true } },
        _count: { select: { matches: true, images: true } },
      },
    });

    return jsonSuccess({ requests });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const form = await request.formData();
    const rawData = form.get("data");
    if (typeof rawData !== "string") {
      return jsonError("Geçersiz form verisi", 400);
    }

    const parsed = createRequestSchema.parse(JSON.parse(rawData));
    const category = await db.category.findUnique({
      where: { id: parsed.categoryId, isActive: true },
    });
    if (!category) return jsonError("Kategori bulunamadı", 404);

    if (parsed.serviceId) {
      const service = await db.service.findFirst({
        where: {
          id: parsed.serviceId,
          categoryId: category.id,
          isActive: true,
        },
      });
      if (!service) return jsonError("Alt hizmet bulunamadı", 404);
    }

    const preferredDate = parsed.preferredDate
      ? new Date(parsed.preferredDate)
      : undefined;

    const areaCheck = await assertServiceAreaEnabled(
      parsed.city,
      parsed.district,
    );
    if (!areaCheck.ok) {
      return jsonError(areaCheck.message, 400);
    }

    const targetProvider = parsed.targetProviderId
      ? await db.provider.findFirst({
          where: {
            id: parsed.targetProviderId,
            status: ProviderStatus.APPROVED,
          },
          select: {
            id: true,
            baseLatitude: true,
            baseLongitude: true,
          },
        })
      : null;
    if (parsed.targetProviderId && !targetProvider) {
      return jsonError("Seçilen usta bulunamadı", 404);
    }

    const serviceRequest = await db.serviceRequest.create({
      data: {
        customerId: user!.id,
        categoryId: category.id,
        serviceId: parsed.serviceId || null,
        description: parsed.description.trim(),
        status: RequestStatus.OPEN,
        city: parsed.city.trim(),
        district: parsed.district?.trim() || null,
        neighborhood: parsed.neighborhood?.trim() || null,
        addressDetail: parsed.addressDetail?.trim() || null,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        preferredDate,
        preferredTime: parsed.preferredTime?.trim() || null,
        urgency: parsed.urgency ?? "normal",
      },
    });

    const imageFiles = form
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0);

    try {
      const urls = await saveRequestImages(serviceRequest.id, imageFiles);
      if (urls.length > 0) {
        await db.requestImage.createMany({
          data: urls.map((url, i) => ({
            requestId: serviceRequest.id,
            url,
            sortOrder: i,
          })),
        });
      }
    } catch (uploadErr) {
      await db.serviceRequest.delete({ where: { id: serviceRequest.id } });
      const message =
        uploadErr instanceof Error ? uploadErr.message : "Yükleme hatası";
      return jsonError(message, 400);
    }

    const matches = await matchProvidersForRequest({
      categorySlug: category.slug,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      city: parsed.city,
      district: parsed.district,
    });
    const matchByProviderId = new Map(
      matches.map((match) => [match.providerId, match]),
    );

    if (targetProvider) {
      if (!matchByProviderId.has(targetProvider.id)) {
        const distanceKm =
          targetProvider.baseLatitude != null &&
          targetProvider.baseLongitude != null
            ? roundDistanceKm(
                haversineKm(
                  parsed.latitude,
                  parsed.longitude,
                  targetProvider.baseLatitude,
                  targetProvider.baseLongitude,
                ),
              )
            : 0;

        matchByProviderId.set(targetProvider.id, {
          providerId: targetProvider.id,
          distanceKm,
        });
      }
    }

    const finalMatches = [...matchByProviderId.values()].sort(
      (a, b) => a.distanceKm - b.distanceKm,
    );

    if (finalMatches.length > 0) {
      await db.requestProviderMatch.createMany({
        data: finalMatches.map((m) => ({
          requestId: serviceRequest.id,
          providerId: m.providerId,
          distanceKm: m.distanceKm,
        })),
      });

      const matchedProviders = await db.provider.findMany({
        where: { id: { in: finalMatches.map((match) => match.providerId) } },
        select: { userId: true },
      });

      await db.notification.createMany({
        data: matchedProviders.map((provider) => ({
          userId: provider.userId,
          type: NotificationType.SYSTEM,
          title: "Yeni hizmet talebi",
          body: `${category.name} için yeni bir talep geldi. Teklif gönderebilirsiniz.`,
          link: `${ROUTES.provider.requests}/${serviceRequest.id}`,
        })),
      });
    }

    return jsonSuccess(
      {
        request: serviceRequest,
        matchCount: finalMatches.length,
      },
      201,
    );
  } catch (err) {
    return handleApiError(err);
  }
}
