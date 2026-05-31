import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { LOCAL_CALLBACK_MESSAGE } from "@/lib/payments/callback-url";
import { generateConversationId } from "@/lib/payments/conversation-id";
import {
  PaymentBuyerInfoError,
  resolvePaymentBuyerInfo,
} from "@/lib/payments/buyer-info";
import {
  getIyzicoSettings,
  isIyzicoSandboxBaseUrl,
} from "@/lib/settings/iyzico";
import {
  amountToKurus,
  assertPublicCallbackUrl,
  getCallbackUrl,
  initializeCheckoutForm,
} from "@/lib/payments/iyzico";
import { getOrderForUser } from "@/lib/orders/access";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

const payBodySchema = z.object({
  identityNumber: z.string().optional(),
  phone: z.string().optional(),
});

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "127.0.0.1";
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const { id } = await params;
    const result = await getOrderForUser(id, user!);
    if (!result || !result.isCustomer) {
      return jsonError("Sipariş bulunamadı", 404);
    }

    const { order } = result;
    if (order.status !== OrderStatus.PENDING_PAYMENT) {
      return jsonError("Bu sipariş için ödeme başlatılamaz", 400);
    }

    let body: z.infer<typeof payBodySchema> = {};
    try {
      const raw = await request.text();
      body = raw ? payBodySchema.parse(JSON.parse(raw)) : {};
    } catch {
      return jsonError("Geçersiz istek gövdesi", 400);
    }

    const phoneForPayment = body.phone?.trim() || order.customer.phone;
    if (body.phone?.trim() && body.phone.trim() !== order.customer.phone) {
      await db.user.update({
        where: { id: user!.id },
        data: { phone: body.phone.trim() },
      });
    }

    const iyzicoSettings = await getIyzicoSettings();
    if (!iyzicoSettings.apiKey || !iyzicoSettings.secretKey) {
      return jsonError(
        "Ödeme sistemi yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
        503,
      );
    }

    let buyerInfo;
    try {
      buyerInfo = resolvePaymentBuyerInfo({
        phone: phoneForPayment,
        identityNumber: body.identityNumber,
        iyzico: {
          isSandbox: isIyzicoSandboxBaseUrl(iyzicoSettings.baseUrl),
          sandboxDefaultIdentity: iyzicoSettings.defaultIdentity,
        },
      });
    } catch (err) {
      if (err instanceof PaymentBuyerInfoError) {
        return jsonError(err.message, 400);
      }
      throw err;
    }

    await assertPublicCallbackUrl();

    const conversationId = generateConversationId();
    const userIp = getClientIp(request);

    await db.payment.updateMany({
      where: { orderId: order.id, status: PaymentStatus.PENDING },
      data: {
        status: PaymentStatus.FAILED,
        failedReason: "Yeni ödeme denemesi başlatıldı",
      },
    });

    const checkout = await initializeCheckoutForm({
      conversationId,
      order: {
        id: order.id,
        title: order.title,
        amount: order.amount,
        customer: order.customer,
        buyer: buyerInfo,
      },
      userIp,
      callbackUrl: await getCallbackUrl(),
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        merchantOid: conversationId,
        checkoutToken: checkout.token,
        status: PaymentStatus.PENDING,
        totalAmountKurus: amountToKurus(order.amount),
      },
    });

    return jsonSuccess({ paymentPageUrl: checkout.paymentPageUrl });
  } catch (err) {
    if (err instanceof Error && err.message === LOCAL_CALLBACK_MESSAGE) {
      return jsonError(err.message, 400);
    }
    return handleApiError(err);
  }
}
