import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "PENDING";

    const providers = await db.provider.findMany({
      where:
        status === "ALL"
          ? undefined
          : { status: status as "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            createdAt: true,
          },
        },
        categories: true,
        serviceAreas: true,
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess({ providers });
  } catch (err) {
    return handleApiError(err);
  }
}
