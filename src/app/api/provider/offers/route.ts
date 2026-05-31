import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonSuccess({ offers: [] });

    const offers = await db.offer.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: "desc" },
      include: {
        request: {
          include: {
            category: { select: { name: true, slug: true } },
            service: { select: { name: true } },
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
      },
    });

    const serialized = offers.map((o) => ({
      id: o.id,
      price: o.price,
      description: o.description,
      estimatedDuration: o.estimatedDuration,
      proposedDate: o.proposedDate,
      status: o.status,
      createdAt: o.createdAt,
      request: {
        id: o.request.id,
        status: o.request.status,
        city: o.request.city,
        district: o.request.district,
        category: o.request.category,
        service: o.request.service,
        imageUrl: o.request.images[0]?.url ?? null,
      },
    }));

    return jsonSuccess({ offers: serialized });
  } catch (err) {
    return handleApiError(err);
  }
}
