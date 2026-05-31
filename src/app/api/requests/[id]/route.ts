import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const serviceRequest = await db.serviceRequest.findFirst({
      where: { id, customerId: user!.id },
      include: {
        category: true,
        service: true,
        images: { orderBy: { sortOrder: "asc" } },
        _count: { select: { matches: true } },
      },
    });

    if (!serviceRequest) return jsonError("Talep bulunamadı", 404);

    return jsonSuccess({ request: serviceRequest });
  } catch (err) {
    return handleApiError(err);
  }
}
