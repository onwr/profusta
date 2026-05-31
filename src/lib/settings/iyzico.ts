import { db } from "@/lib/db";

export const IYZICO_SETTING_KEYS = {
  apiKey: "iyzico_api_key",
  secretKey: "iyzico_secret_key",
  baseUrl: "iyzico_base_url",
  callbackUrl: "iyzico_callback_url",
  defaultIdentity: "iyzico_default_identity",
} as const;

export type IyzicoSettings = {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
  callbackUrl: string;
  defaultIdentity: string;
};

export type IyzicoSettingsAdminView = {
  apiKey: string;
  hasSecretKey: boolean;
  baseUrl: string;
  callbackUrl: string;
  defaultIdentity: string;
  isConfigured: boolean;
};

const DEFAULT_BASE_URL = "https://sandbox-api.iyzipay.com";

function defaultCallbackUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/+$/, "")}/api/payments/iyzico/callback`;
}

export async function getIyzicoSettings(): Promise<IyzicoSettings> {
  const rows = await db.platformSetting.findMany({
    where: { key: { in: Object.values(IYZICO_SETTING_KEYS) } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    apiKey: map.get(IYZICO_SETTING_KEYS.apiKey)?.trim() ?? "",
    secretKey: map.get(IYZICO_SETTING_KEYS.secretKey)?.trim() ?? "",
    baseUrl:
      map.get(IYZICO_SETTING_KEYS.baseUrl)?.trim().replace(/\/+$/, "") ||
      DEFAULT_BASE_URL,
    callbackUrl:
      map.get(IYZICO_SETTING_KEYS.callbackUrl)?.trim() || defaultCallbackUrl(),
    defaultIdentity:
      map.get(IYZICO_SETTING_KEYS.defaultIdentity)?.replace(/\D/g, "") ?? "",
  };
}

export async function getIyzicoSettingsForAdmin(): Promise<IyzicoSettingsAdminView> {
  const settings = await getIyzicoSettings();
  return {
    apiKey: settings.apiKey,
    hasSecretKey: Boolean(settings.secretKey),
    baseUrl: settings.baseUrl,
    callbackUrl: settings.callbackUrl,
    defaultIdentity: settings.defaultIdentity,
    isConfigured: Boolean(settings.apiKey && settings.secretKey),
  };
}

export async function setIyzicoSettings(
  data: Partial<{
    apiKey: string;
    secretKey: string;
    baseUrl: string;
    callbackUrl: string;
    defaultIdentity: string;
  }>,
) {
  const upserts: Promise<unknown>[] = [];

  if (data.apiKey != null) {
    upserts.push(upsert(IYZICO_SETTING_KEYS.apiKey, data.apiKey.trim()));
  }
  if (data.secretKey != null && data.secretKey.trim()) {
    upserts.push(upsert(IYZICO_SETTING_KEYS.secretKey, data.secretKey.trim()));
  }
  if (data.baseUrl != null) {
    upserts.push(
      upsert(
        IYZICO_SETTING_KEYS.baseUrl,
        data.baseUrl.trim().replace(/\/+$/, ""),
      ),
    );
  }
  if (data.callbackUrl != null) {
    upserts.push(upsert(IYZICO_SETTING_KEYS.callbackUrl, data.callbackUrl.trim()));
  }
  if (data.defaultIdentity != null) {
    upserts.push(
      upsert(
        IYZICO_SETTING_KEYS.defaultIdentity,
        data.defaultIdentity.replace(/\D/g, ""),
      ),
    );
  }

  await Promise.all(upserts);
}

async function upsert(key: string, value: string) {
  await db.platformSetting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export function isIyzicoSandboxBaseUrl(baseUrl: string): boolean {
  return baseUrl.includes("sandbox");
}
