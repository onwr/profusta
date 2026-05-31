import { ListingStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { adminListingActionSchema } from "@/lib/validations/listing";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { action, rejectedReason } = adminListingActionSchema.parse(body);

    const existing = await db.listing.findUnique({ where: { id } });
    if (!existing) return jsonError("İlan bulunamadı", 404);

    let data: {
      status: ListingStatus;
      rejectedReason?: string | null;
      approvedAt?: Date | null;
    };

    if (action === "approve") {
      data = {
        status: ListingStatus.ACTIVE,
        rejectedReason: null,
        approvedAt: new Date(),
      };
    } else if (action === "reject") {
      data = {
        status: ListingStatus.REJECTED,
        rejectedReason: rejectedReason?.trim() || "Admin tarafından reddedildi",
        approvedAt: null,
      };
    } else {
      data = {
        status: ListingStatus.INACTIVE,
        rejectedReason: null,
        approvedAt: existing.approvedAt,
      };
    }

    const listing = await db.listing.update({
      where: { id },
      data,
    });

    return jsonSuccess({ listing });
  } catch (err) {
    return handleApiError(err);
  }
}
