import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { saveHomepageAsset, StorageConfigError } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");

    if (!(file instanceof File)) {
      return handleApiError(new Error("Dosya gerekli"));
    }
    if (kind !== "hero" && kind !== "mobile") {
      return handleApiError(new Error("Geçersiz kind"));
    }

    try {
      const url = await saveHomepageAsset(file, kind);
      return jsonSuccess({ url });
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
