import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function PATCH() {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    await db.notification.updateMany({
      where: { userId: user!.id, readAt: null },
      data: { readAt: new Date() },
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
