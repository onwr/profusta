import { OfferStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import {
  assertCanCreateOffer,
  getProviderForUser,
} from "@/lib/offers/rules";
import { notifyOfferReceived } from "@/lib/notifications/create";
import { createOfferSchema } from "@/lib/validations/offer";

const appUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const { id: requestId } = await params;
    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const check = await assertCanCreateOffer(requestId, provider.id);
    if (!check.ok) return jsonError(check.error, check.status);

    const body = await request.json();
    const data = createOfferSchema.parse(body);
    const proposedDate = data.proposedDate
      ? new Date(data.proposedDate)
      : undefined;

    const existing = await db.offer.findUnique({
      where: {
        requestId_providerId: { requestId, providerId: provider.id },
      },
    });

    const offer =
      existing?.status === OfferStatus.WITHDRAWN
        ? await db.offer.update({
            where: { id: existing.id },
            data: {
              price: data.price,
              description: data.description.trim(),
              estimatedDuration: data.estimatedDuration?.trim() || null,
              proposedDate,
              status: OfferStatus.PENDING,
            },
          })
        : await db.offer.create({
            data: {
              requestId,
              providerId: provider.id,
              price: data.price,
              description: data.description.trim(),
              estimatedDuration: data.estimatedDuration?.trim() || null,
              proposedDate,
            },
          });

    const serviceRequest = await db.serviceRequest.findUnique({
      where: { id: requestId },
      include: {
        customer: { select: { id: true, email: true } },
        category: { select: { name: true } },
      },
    });
    if (serviceRequest) {
      await notifyOfferReceived({
        customerId: serviceRequest.customer.id,
        customerEmail: serviceRequest.customer.email,
        providerName: user!.fullName,
        requestTitle: serviceRequest.category.name,
        price: offer.price,
        link: `${appUrl()}/musteri/talepler/${requestId}`,
      });
    }

    return jsonSuccess({ offer }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
