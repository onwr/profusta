import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        provider: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonSuccess({ users });
  } catch (err) {
    return handleApiError(err);
  }
}
