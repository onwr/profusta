import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { getProviderRating } from "@/lib/reviews/aggregate";
import { z } from "zod";

const addSchema = z.object({ providerId: z.string().min(1) });

export async function GET() {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const favorites = await db.favorite.findMany({
      where: { customerId: user!.id },
      orderBy: { createdAt: "desc" },
      include: {
        provider: {
          include: {
            user: { select: { fullName: true } },
            categories: { take: 3 },
          },
        },
      },
    });

    const items = await Promise.all(
      favorites.map(async (f) => {
        const rating = await getProviderRating(f.providerId);
        return {
          id: f.id,
          providerId: f.providerId,
          providerSlug: f.provider.slug,
          fullName: f.provider.user.fullName,
          bio: f.provider.bio,
          baseCity: f.provider.baseCity,
          categories: f.provider.categories.map((c) => c.categorySlug),
          ...rating,
        };
      }),
    );

    return jsonSuccess({ favorites: items });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { providerId } = addSchema.parse(await request.json());
    const provider = await db.provider.findFirst({
      where: { id: providerId, status: "APPROVED" },
    });
    if (!provider) return jsonError("Usta bulunamadı", 404);

    const fav = await db.favorite.upsert({
      where: {
        customerId_providerId: {
          customerId: user!.id,
          providerId,
        },
      },
      create: { customerId: user!.id, providerId },
      update: {},
    });

    return jsonSuccess({ favorite: { id: fav.id, providerId } }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
