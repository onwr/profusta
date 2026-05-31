import { ProviderStatus } from "@/generated/prisma/client";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { PROVIDER_RATING_PLACEHOLDER } from "@/lib/offers/rules";
import { db } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const provider = await db.provider.findFirst({
      where: {
        status: ProviderStatus.APPROVED,
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: { select: { fullName: true } },
        categories: true,
        serviceAreas: { where: { isActive: true } },
      },
    });

    if (!provider) return jsonError("Usta bulunamadı", 404);

    return jsonSuccess({
      provider: {
        id: provider.id,
        slug: provider.slug,
        fullName: provider.user.fullName,
        bio: provider.bio,
        baseCity: provider.baseCity,
        baseDistrict: provider.baseDistrict,
        serviceRadiusKm: provider.serviceRadiusKm,
        categories: provider.categories.map((c) => c.categorySlug),
        serviceAreas: provider.serviceAreas,
        ...PROVIDER_RATING_PLACEHOLDER,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
