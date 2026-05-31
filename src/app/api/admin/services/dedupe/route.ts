import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { dedupeServices } from "@/lib/categories/dedupe-services";

export async function POST() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const result = await dedupeServices();

    await logAdminAction({
      adminId: user!.id,
      action: "services_dedupe",
      details: JSON.stringify(result),
    });

    return jsonSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
