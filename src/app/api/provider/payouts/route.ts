import { BalanceEntryType, PayoutStatus } from "@/generated/prisma/client";
import { requireProvider } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getProviderForUser } from "@/lib/offers/rules";
import { getProviderAvailableBalance } from "@/lib/orders/transitions";
import { db } from "@/lib/db";
import { payoutSchema } from "@/lib/validations/order";
import { maskIban } from "@/lib/validations/iban";

export async function GET() {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) {
      return jsonSuccess({
        payouts: [],
        availableBalance: 0,
        hasIban: false,
        ibanMasked: null,
      });
    }

    const [payouts, availableBalance] = await Promise.all([
      db.payout.findMany({
        where: { providerId: provider.id },
        orderBy: { createdAt: "desc" },
      }),
      getProviderAvailableBalance(provider.id),
    ]);

    return jsonSuccess({
      payouts: payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        iban: maskIban(p.iban),
        status: p.status,
        adminNote: p.adminNote,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      availableBalance: Math.round(availableBalance * 100) / 100,
      hasIban: Boolean(provider.iban),
      ibanMasked: provider.iban ? maskIban(provider.iban) : null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    const { user, error } = await requireProvider();
    if (error) return error;

    const provider = await getProviderForUser(user!.id);
    if (!provider) return jsonError("Usta profili bulunamadı", 404);

    const { amount } = payoutSchema.parse(await request.json());
    const available = await getProviderAvailableBalance(provider.id);

    if (amount > available) {
      return jsonError(`Kullanılabilir bakiye: ${available} ₺`, 400);
    }

    if (!provider.iban) {
      return jsonError("Önce profilinize IBAN ekleyin", 400);
    }

    const payout = await db.$transaction(async (tx) => {
      const created = await tx.payout.create({
        data: {
          providerId: provider.id,
          amount,
          iban: provider.iban!,
          status: PayoutStatus.PENDING,
        },
      });
      await tx.providerBalance.create({
        data: {
          providerId: provider.id,
          type: BalanceEntryType.PAYOUT,
          amount,
          note: `Ödeme talebi ${created.id}`,
        },
      });
      return created;
    });

    return jsonSuccess({ payout }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
