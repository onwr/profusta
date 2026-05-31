import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { upsertHomepageConfig } from "@/lib/homepage/db";
import { getHomepageConfigForAdmin } from "@/lib/homepage/get-homepage-content";
import { homepageConfigSchema } from "@/lib/validations/homepage";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;
    return jsonSuccess({ config: await getHomepageConfigForAdmin() });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const parsed = homepageConfigSchema.parse(await request.json());
    const data = Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => v !== null),
    ) as Partial<import("@/lib/homepage/defaults").HomepageConfigData>;
    await upsertHomepageConfig(data);

    await logAdminAction({
      adminId: user!.id,
      action: "homepage_update",
      details: JSON.stringify(Object.keys(data)),
    });

    return jsonSuccess({ config: await getHomepageConfigForAdmin() });
  } catch (err) {
    return handleApiError(err);
  }
}
