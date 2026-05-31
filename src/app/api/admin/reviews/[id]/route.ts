import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  isVisible: z.boolean(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { isVisible } = schema.parse(await request.json());

    const review = await db.review.update({
      where: { id },
      data: { isVisible },
    });

    return jsonSuccess({ review });
  } catch (err) {
    return handleApiError(err);
  }
}
