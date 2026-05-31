import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import {
  getGoogleOAuthSettings,
  getGoogleOAuthSettingsForAdmin,
  setGoogleOAuthSettings,
} from "@/lib/settings/google-oauth";
import { googleOAuthSettingsPatchSchema } from "@/lib/validations/google-oauth-settings";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const settings = await getGoogleOAuthSettingsForAdmin();
    return jsonSuccess({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = googleOAuthSettingsPatchSchema.parse(await request.json());
    const current = await getGoogleOAuthSettings();

    if (!data.clientSecret?.trim() && !current.clientSecret) {
      return jsonError("Client Secret gerekli", 400);
    }

    await setGoogleOAuthSettings({
      clientId: data.clientId,
      clientSecret: data.clientSecret?.trim() || undefined,
    });

    const settings = await getGoogleOAuthSettingsForAdmin();
    return jsonSuccess({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}
