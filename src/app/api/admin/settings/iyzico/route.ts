import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import {
  getIyzicoSettings,
  getIyzicoSettingsForAdmin,
  setIyzicoSettings,
} from "@/lib/settings/iyzico";
import { iyzicoSettingsPatchSchema } from "@/lib/validations/iyzico-settings";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const settings = await getIyzicoSettingsForAdmin();
    return jsonSuccess({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const data = iyzicoSettingsPatchSchema.parse(await request.json());
    const current = await getIyzicoSettings();

    if (!data.secretKey?.trim() && !current.secretKey) {
      return jsonError("İyzico gizli anahtarı (secret key) gerekli", 400);
    }

    await setIyzicoSettings({
      apiKey: data.apiKey,
      secretKey: data.secretKey?.trim() || undefined,
      baseUrl: data.baseUrl,
      callbackUrl: data.callbackUrl,
      defaultIdentity: data.defaultIdentity,
    });

    const settings = await getIyzicoSettingsForAdmin();
    return jsonSuccess({ settings });
  } catch (err) {
    return handleApiError(err);
  }
}
