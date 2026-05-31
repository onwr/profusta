import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import type { RequestStatus } from "@/generated/prisma/client";

export async function GET(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as RequestStatus | null;
    const categoryId = searchParams.get("categoryId");

    const requests = await db.serviceRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        category: { select: { id: true, name: true, slug: true } },
        service: { select: { id: true, name: true } },
        _count: { select: { matches: true, images: true } },
      },
    });

    return jsonSuccess({ requests });
  } catch (err) {
    return handleApiError(err);
  }
}
