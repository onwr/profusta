import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { logAdminAction } from "@/lib/admin/log";
import { db } from "@/lib/db";
import { saveCategoryCover, StorageConfigError } from "@/lib/upload";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) return jsonError("Kategori bulunamadı", 404);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return jsonError("Dosya gerekli", 400);
    }

    try {
      const coverImageUrl = await saveCategoryCover(id, file);
      const category = await db.category.update({
        where: { id },
        data: { coverImageUrl },
      });

      await logAdminAction({
        adminId: user!.id,
        action: "category_cover_update",
        details: JSON.stringify({ id }),
      });

      return jsonSuccess({ category, coverImageUrl });
    } catch (uploadErr) {
      if (uploadErr instanceof StorageConfigError) {
        return handleApiError(uploadErr);
      }
      throw uploadErr;
    }
  } catch (err) {
    return handleApiError(err);
  }
}
