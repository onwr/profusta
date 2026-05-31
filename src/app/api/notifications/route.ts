import { requireSession } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { user, error } = await requireSession();
    if (error) return error;

    const params = new URL(request.url).searchParams;
    const limit = Math.min(Number(params.get("limit") ?? 20), 100);
    const offset = Math.max(Number(params.get("offset") ?? 0), 0);
    const unreadOnly = params.get("unreadOnly") === "true";

    const where = {
      userId: user!.id,
      ...(unreadOnly ? { readAt: null } : {}),
    };

    const [notifications, unreadCount, total] = await Promise.all([
      db.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      db.notification.count({
        where: { userId: user!.id, readAt: null },
      }),
      db.notification.count({ where }),
    ]);

    return jsonSuccess({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        link: n.link,
        readAt: n.readAt?.toISOString() ?? null,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
      total,
      hasMore: offset + notifications.length < total,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
