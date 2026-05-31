import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ providerId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { providerId } = await params;
    await db.favorite.deleteMany({
      where: { customerId: user!.id, providerId },
    });

    return jsonSuccess({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
