import { PayoutStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject", "mark_paid"]),
  adminNote: z.string().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const { action, adminNote } = actionSchema.parse(await request.json());

    const payout = await db.payout.findUnique({ where: { id } });
    if (!payout) return jsonError("Talep bulunamadı", 404);

    let status: PayoutStatus;
    if (action === "approve") status = PayoutStatus.APPROVED;
    else if (action === "reject") status = PayoutStatus.REJECTED;
    else status = PayoutStatus.PAID;

    const updated = await db.payout.update({
      where: { id },
      data: { status, adminNote: adminNote ?? payout.adminNote },
    });

    return jsonSuccess({ payout: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
