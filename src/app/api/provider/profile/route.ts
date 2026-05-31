import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { updateProviderProfileSchema } from "@/lib/validations/offer";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await db.provider.findUnique({
      where: { userId: user!.id },
      include: {
        categories: true,
        faqs: { orderBy: { sortOrder: "asc" } },
        serviceAreas: true,
        user: {
          select: { fullName: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });
    if (!provider) return jsonError("Profil bulunamadı", 404);

    const slugs = provider.categories.map((c) => c.categorySlug);
    const categoryMeta =
      slugs.length > 0
        ? await db.category.findMany({
            where: { slug: { in: slugs } },
            select: { slug: true, name: true },
          })
        : [];

    const nameBySlug = new Map(categoryMeta.map((c) => [c.slug, c.name]));

    return jsonSuccess({
      provider: {
        ...provider,
        categories: provider.categories.map((c) => ({
          categorySlug: c.categorySlug,
          name: nameBySlug.get(c.categorySlug) ?? c.categorySlug,
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const body = await request.json();
    const data = updateProviderProfileSchema.parse(body);

    const provider = await db.provider.update({
      where: { userId: user!.id },
      data: {
        bio: data.bio?.trim(),
        iban: data.iban ?? null,
        baseCity: data.baseCity?.trim(),
        baseDistrict: data.baseDistrict?.trim(),
        baseLatitude: data.baseLatitude,
        baseLongitude: data.baseLongitude,
        serviceRadiusKm: data.serviceRadiusKm,
      },
    });

    if (data.faqs) {
      const faqs = data.faqs
        .map((faq) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter((faq) => faq.question && faq.answer);

      await db.providerFaq.deleteMany({
        where: { providerId: provider.id },
      });

      if (faqs.length > 0) {
        await db.providerFaq.createMany({
          data: faqs.map((faq, index) => ({
            providerId: provider.id,
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
          })),
        });
      }
    }

    return jsonSuccess({ provider });
  } catch (err) {
    return handleApiError(err);
  }
}
