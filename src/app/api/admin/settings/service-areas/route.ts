import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { getProvinces } from "@/lib/geo/turkey";
import {
  countEnabledAreas,
  getServiceAreasConfig,
  setServiceAreasConfig,
  type ServiceAreasConfig,
  validateServiceAreasConfig,
} from "@/lib/settings/service-areas";
import { z } from "zod";

const schema = z.object({
  enabled: z.record(z.string(), z.array(z.string())),
});

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const config = await getServiceAreasConfig();
    const stats = countEnabledAreas(config);

    return jsonSuccess({
      config,
      stats,
      provinces: getProvinces().map((p) => ({
        name: p.name,
        slug: p.slug,
        towns: p.towns.map((t) => ({ name: t.name, slug: t.slug })),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: Request) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const body = schema.parse(await request.json()) as ServiceAreasConfig;

    try {
      validateServiceAreasConfig(body);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Geçersiz yapılandırma";
      return jsonError(message, 400);
    }

    await setServiceAreasConfig(body);

    await logAdminAction({
      adminId: user!.id,
      action: "service_areas_update",
      details: JSON.stringify(countEnabledAreas(body)),
    });

    const config = await getServiceAreasConfig();
    return jsonSuccess({
      config,
      stats: countEnabledAreas(config),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
