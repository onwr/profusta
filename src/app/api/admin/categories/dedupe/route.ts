import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { dedupeCategories } from "@/lib/categories/dedupe";

export async function POST() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const result = await dedupeCategories();

    await logAdminAction({
      adminId: user!.id,
      action: "categories_dedupe",
      details: JSON.stringify(result),
    });

    return jsonSuccess(result);
  } catch (err) {
    return handleApiError(err);
  }
}
