import { db } from "@/lib/db";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
}) {
  await db.adminLog.create({
    data: {
      adminId: params.adminId,
      action: params.action,
      entityType: params.entityType ?? null,
      entityId: params.entityId ?? null,
      details: params.details ?? null,
    },
  });
}
