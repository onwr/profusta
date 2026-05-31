import { z } from "zod";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

const patchSchema = z.object({
  action: z.enum(["approve", "reject", "suspend", "setPro"]),
  isPro: z.boolean().optional(),
  rejectedReason: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = patchSchema.parse(await request.json());

    const provider = await db.provider.findUnique({ where: { id } });
    if (!provider) {
      return jsonError("Usta bulunamadı", 404);
    }

    if (body.action === "approve") {
      await db.provider.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          rejectedReason: null,
        },
      });
    } else if (body.action === "reject") {
      await db.provider.update({
        where: { id },
        data: {
          status: "REJECTED",
          rejectedReason: body.rejectedReason ?? "Başvuru reddedildi",
          approvedAt: null,
        },
      });
    } else if (body.action === "setPro") {
      await db.provider.update({
        where: { id },
        data: { isPro: body.isPro ?? false },
      });
    } else {
      await db.provider.update({
        where: { id },
        data: { status: "SUSPENDED" },
      });
    }

    return jsonSuccess({ message: "İşlem başarılı" });
  } catch (err) {
    return handleApiError(err);
  }
}
