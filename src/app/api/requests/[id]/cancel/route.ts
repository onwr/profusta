import { RequestStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const existing = await db.serviceRequest.findFirst({
      where: { id, customerId: user!.id },
    });

    if (!existing) return jsonError("Talep bulunamadı", 404);
    if (existing.status !== RequestStatus.OPEN) {
      return jsonError("Bu talep iptal edilemez", 400);
    }

    const serviceRequest = await db.serviceRequest.update({
      where: { id },
      data: { status: RequestStatus.CANCELLED },
    });

    return jsonSuccess({ request: serviceRequest });
  } catch (err) {
    return handleApiError(err);
  }
}
