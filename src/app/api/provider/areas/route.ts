import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getCentroid } from "@/lib/geo/turkey";
import { getProviderForUser } from "@/lib/offers/rules";
import {
  assertServiceAreaEnabled,
  getServiceAreasConfig,
  resolveEnabledAreas,
} from "@/lib/settings/service-areas";
import { db } from "@/lib/db";
import {
  areaSelectionKey,
  updateProviderAreasSchema,
} from "@/lib/validations/provider";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    const config = await getServiceAreasConfig();
    const available = resolveEnabledAreas(config);

    const areas = provider
      ? await db.providerServiceArea.findMany({
          where: { providerId: provider.id, isActive: true },
          orderBy: [{ city: "asc" }, { district: "asc" }],
        })
      : [];

    return jsonSuccess({
      available,
      areas: areas.map((a) => ({
        id: a.id,
        city: a.city,
        district: a.district,
        radiusKm: a.radiusKm,
        isActive: a.isActive,
      })),
      defaultRadiusKm: provider?.serviceRadiusKm ?? 20,
      hasAreas: available.length > 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const body = updateProviderAreasSchema.parse(await request.json());
    const fallbackRadius = body.defaultRadiusKm ?? provider.serviceRadiusKm ?? 20;

    const unique = new Map<
      string,
      { city: string; district: string; radiusKm: number }
    >();

    for (const item of body.areas) {
      const city = item.city.trim();
      const district = item.district.trim();
      const key = areaSelectionKey(city, district);

      const check = await assertServiceAreaEnabled(city, district);
      if (!check.ok) {
        return jsonError(`${city} / ${district}: ${check.message}`, 400);
      }

      unique.set(key, {
        city,
        district,
        radiusKm: item.radiusKm ?? fallbackRadius,
      });
    }

    const toSave = [...unique.values()];

    await db.$transaction(async (tx) => {
      await tx.providerServiceArea.deleteMany({
        where: { providerId: provider.id },
      });

      if (toSave.length > 0) {
        await tx.providerServiceArea.createMany({
          data: toSave.map((a) => {
            const centroid = getCentroid(a.city, a.district);
            return {
              providerId: provider.id,
              city: a.city,
              district: a.district,
              latitude: centroid?.lat ?? null,
              longitude: centroid?.lng ?? null,
              radiusKm: a.radiusKm,
              isActive: true,
            };
          }),
        });
      }

      if (body.defaultRadiusKm != null) {
        await tx.provider.update({
          where: { id: provider.id },
          data: { serviceRadiusKm: body.defaultRadiusKm },
        });
      }
    });

    const saved = await db.providerServiceArea.findMany({
      where: { providerId: provider.id, isActive: true },
      orderBy: [{ city: "asc" }, { district: "asc" }],
    });

    return jsonSuccess({
      areas: saved.map((a) => ({
        id: a.id,
        city: a.city,
        district: a.district,
        radiusKm: a.radiusKm,
        isActive: a.isActive,
      })),
      defaultRadiusKm: body.defaultRadiusKm ?? provider.serviceRadiusKm,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
