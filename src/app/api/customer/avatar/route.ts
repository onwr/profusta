import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { saveUserAvatar, StorageConfigError } from "@/lib/upload";

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const form = await request.formData();
    const file = form.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      return jsonError("Fotoğraf seçin", 400);
    }

    let avatarUrl: string;
    try {
      avatarUrl = await saveUserAvatar(user!.id, file);
    } catch (uploadErr) {
      const msg =
        uploadErr instanceof Error ? uploadErr.message : "Yükleme hatası";
      return jsonError(msg, 400);
    }

    await db.user.update({
      where: { id: user!.id },
      data: { avatarUrl },
    });

    return jsonSuccess({ avatarUrl });
  } catch (err) {
    if (err instanceof StorageConfigError) {
      return jsonError(err.message, 503);
    }
    return handleApiError(err);
  }
}

export async function DELETE() {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    await db.user.update({
      where: { id: user!.id },
      data: { avatarUrl: null },
    });

    return jsonSuccess({ avatarUrl: null });
  } catch (err) {
    return handleApiError(err);
  }
}
