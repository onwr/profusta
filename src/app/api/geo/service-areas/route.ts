import { handleApiError, jsonSuccess } from "@/lib/api";
import {
  getDefaultServiceArea,
  getServiceAreasConfig,
  resolveEnabledAreas,
} from "@/lib/settings/service-areas";

export async function GET() {
  try {
    const config = await getServiceAreasConfig();
    const areas = resolveEnabledAreas(config);
    const defaultArea = getDefaultServiceArea(config);

    return jsonSuccess({
      areas,
      default: defaultArea,
      hasAreas: areas.length > 0,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
