import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { getSiteSettings, setSiteSettings } from "@/lib/settings/site";
import { z } from "zod";

const schema = z.object({
  siteName: z.string().min(1).max(100).optional(),
  supportEmail: z.string().email().optional(),
  maintenanceMode: z.boolean().optional(),
  heroTagline: z.string().max(200).optional(),
});

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    return jsonSuccess({ settings: await getSiteSettings() });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const data = schema.parse(await request.json());
    await setSiteSettings(data);

    await logAdminAction({
      adminId: user!.id,
      action: "site_settings_update",
      details: JSON.stringify(data),
    });

    return jsonSuccess({ settings: await getSiteSettings() });
  } catch (err) {
    return handleApiError(err);
  }
}
