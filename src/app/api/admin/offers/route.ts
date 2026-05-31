import type { OfferStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get("requestId");
    const status = searchParams.get("status") as OfferStatus | null;

    const offers = await db.offer.findMany({
      where: {
        ...(requestId ? { requestId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          include: { user: { select: { fullName: true, email: true } } },
        },
        request: {
          include: { category: { select: { name: true } } },
        },
      },
    });

    return jsonSuccess({ offers });
  } catch (err) {
    return handleApiError(err);
  }
}
