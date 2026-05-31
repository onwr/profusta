import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";

/** Manuel popüler hizmet kartlarını siler; anasayfa otomatik kategori moduna döner. */
export async function POST() {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const result = await db.homepageItem.deleteMany({
      where: { type: "FEATURED_SERVICE" },
    });

    await logAdminAction({
      adminId: user!.id,
      action: "homepage_featured_reset",
      details: JSON.stringify({ deleted: result.count }),
    });

    return jsonSuccess({ deleted: result.count });
  } catch (err) {
    return handleApiError(err);
  }
}
