import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const { id } = await params;
    const n = await db.notification.findFirst({
      where: { id, userId: user!.id },
    });
    if (!n) return jsonError("Bildirim bulunamadı", 404);

    await db.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
