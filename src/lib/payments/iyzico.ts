import crypto from "crypto";
import {
  isPublicCallbackUrl,
  LOCAL_CALLBACK_MESSAGE,
} from "@/lib/payments/callback-url";
import { normalizeTurkishPhone } from "@/lib/payments/buyer-info";
import { getIyzicoSettings } from "@/lib/settings/iyzico";

const INITIALIZE_PATH =
  "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const RETRIEVE_PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export type IyzipayRetrieveResponse = {
  status: string;
  errorMessage?: string;
  paymentStatus?: string;
  paymentId?: string;
  paidPrice?: string;
  price?: string;
  conversationId?: string;
  token?: string;
};

type IyzipayResponse = {
  status: string;
  errorMessage?: string;
  token?: string;
  paymentPageUrl?: string;
  conversationId?: string;
};

async function getConfig() {
  const settings = await getIyzicoSettings();

  if (!settings.apiKey || !settings.secretKey) {
    throw new Error(
      "İyzico yapılandırması eksik — Admin → İyzico ödeme ayarlarından API bilgilerini girin.",
    );
  }

  return {
    apiKey: settings.apiKey,
    secretKey: settings.secretKey,
    baseUrl: settings.baseUrl,
  };
}

function generateRandomKey(): string {
  return `${process.hrtime.bigint()}${Math.random().toString(36).slice(2, 10)}`;
}

function buildAuthorization(
  apiKey: string,
  secretKey: string,
  path: string,
  body: Record<string, unknown>,
  randomKey: string,
): string {
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(randomKey + path + JSON.stringify(body))
    .digest("hex");

  const params = [
    `apiKey:${apiKey}`,
    `randomKey:${randomKey}`,
    `signature:${signature}`,
  ].join("&");

  return `IYZWSv2 ${Buffer.from(params).toString("base64")}`;
}

async function iyzicoPost<T extends IyzipayResponse | IyzipayRetrieveResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const { apiKey, secretKey, baseUrl } = await getConfig();
  const randomKey = generateRandomKey();
  const authorization = buildAuthorization(
    apiKey,
    secretKey,
    path,
    body,
    randomKey,
  );

  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization,
      "x-iyzi-rnd": randomKey,
      "x-iyzi-client-version": "profusta-iyzico-1",
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json()) as T;
  return data;
}

export async function getCallbackUrl(): Promise<string> {
  const settings = await getIyzicoSettings();
  return settings.callbackUrl;
}

export async function assertPublicCallbackUrl(): Promise<void> {
  const url = await getCallbackUrl();
  if (!isPublicCallbackUrl(url)) {
    throw new Error(LOCAL_CALLBACK_MESSAGE);
  }
}

/** İyzico fiyat formatı (ör. 2500 → "2500.0") */
export function formatPriceTl(amount: number): string {
  const n = parseFloat(amount.toString());
  const s = n.toString();
  return s.includes(".") ? s : `${s}.0`;
}

export function amountToKurus(amount: number): number {
  return Math.round(amount * 100);
}

export function splitBuyerName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: "Müşteri", surname: "." };
  if (parts.length === 1) return { name: parts[0], surname: "." };
  const surname = parts.pop()!;
  return { name: parts.join(" "), surname };
}

/** @deprecated normalizeTurkishPhone kullanın */
export function formatGsmNumber(phone: string): string {
  return normalizeTurkishPhone(phone);
}

const nowFormatted = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export type CheckoutOrderInput = {
  id: string;
  title: string;
  amount: number;
  customer: {
    id: string;
    email: string;
    fullName: string;
    phone: string | null;
  };
  buyer: {
    gsmNumber: string;
    identityNumber: string;
  };
};

export async function initializeCheckoutForm(params: {
  conversationId: string;
  order: CheckoutOrderInput;
  userIp: string;
  callbackUrl: string;
}): Promise<{
  token: string;
  paymentPageUrl: string;
  conversationId: string;
}> {
  const { name, surname } = splitBuyerName(params.order.customer.fullName);
  const price = formatPriceTl(params.order.amount);
  const { gsmNumber, identityNumber } = params.order.buyer;
  const address = "Türkiye";

  const body = {
    locale: "tr",
    conversationId: params.conversationId,
    price,
    paidPrice: price,
    currency: "TRY",
    basketId: params.order.id,
    paymentGroup: "PRODUCT",
    callbackUrl: params.callbackUrl,
    enabledInstallments: [1, 2, 3, 6, 9],
    buyer: {
      id: params.order.customer.id,
      name,
      surname,
      gsmNumber,
      email: params.order.customer.email,
      identityNumber,
      registrationAddress: address,
      lastLoginDate: nowFormatted(),
      registrationDate: nowFormatted(),
      ip: params.userIp,
      city: "Istanbul",
      country: "Turkey",
      zipCode: "34000",
    },
    shippingAddress: {
      contactName: params.order.customer.fullName,
      city: "Istanbul",
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    billingAddress: {
      contactName: params.order.customer.fullName,
      city: "Istanbul",
      country: "Turkey",
      address,
      zipCode: "34000",
    },
    basketItems: [
      {
        id: params.order.id,
        name: params.order.title.slice(0, 100),
        category1: "Hizmet",
        category2: "ProfUSTA",
        itemType: "VIRTUAL",
        price,
      },
    ],
  };

  const result = await iyzicoPost<IyzipayResponse>(INITIALIZE_PATH, body);

  if (result.status !== "success" || !result.token || !result.paymentPageUrl) {
    throw new Error(result.errorMessage ?? "İyzico ödeme formu başlatılamadı");
  }

  return {
    token: result.token,
    paymentPageUrl: result.paymentPageUrl,
    conversationId: params.conversationId,
  };
}

export async function retrieveCheckoutForm(params: {
  conversationId: string;
  token: string;
}): Promise<IyzipayRetrieveResponse> {
  const result = await iyzicoPost<IyzipayRetrieveResponse>(RETRIEVE_PATH, {
    locale: "tr",
    conversationId: params.conversationId,
    token: params.token,
  });

  if (result.status !== "success") {
    throw new Error(result.errorMessage ?? "İyzico ödeme sonucu alınamadı");
  }

  return result;
}
