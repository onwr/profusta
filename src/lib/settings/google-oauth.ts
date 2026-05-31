import { db } from "@/lib/db";

export const GOOGLE_OAUTH_SETTING_KEYS = {
  clientId: "google_oauth_client_id",
  clientSecret: "google_oauth_client_secret",
} as const;

export type GoogleOAuthSettings = {
  clientId: string;
  clientSecret: string;
};

export type GoogleOAuthSettingsAdminView = {
  clientId: string;
  hasClientSecret: boolean;
  redirectUri: string;
  javascriptOrigin: string;
  isConfigured: boolean;
};

export function getGoogleOAuthRedirectUri(): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    .replace(/\/+$/, "");
  return `${appUrl}/api/auth/google/callback`;
}

export function getGoogleOAuthJavascriptOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/+$/,
    "",
  );
}

export async function getGoogleOAuthSettings(): Promise<GoogleOAuthSettings> {
  const rows = await db.platformSetting.findMany({
    where: { key: { in: Object.values(GOOGLE_OAUTH_SETTING_KEYS) } },
  });
  const map = new Map(rows.map((r) => [r.key, r.value]));

  return {
    clientId: map.get(GOOGLE_OAUTH_SETTING_KEYS.clientId)?.trim() ?? "",
    clientSecret:
      map.get(GOOGLE_OAUTH_SETTING_KEYS.clientSecret)?.trim() ?? "",
  };
}

export async function getGoogleOAuthSettingsForAdmin(): Promise<GoogleOAuthSettingsAdminView> {
  const settings = await getGoogleOAuthSettings();
  return {
    clientId: settings.clientId,
    hasClientSecret: Boolean(settings.clientSecret),
    redirectUri: getGoogleOAuthRedirectUri(),
    javascriptOrigin: getGoogleOAuthJavascriptOrigin(),
    isConfigured: Boolean(settings.clientId && settings.clientSecret),
  };
}

export async function setGoogleOAuthSettings(
  data: Partial<{ clientId: string; clientSecret: string }>,
) {
  const upserts: Promise<unknown>[] = [];

  if (data.clientId != null) {
    upserts.push(
      upsert(GOOGLE_OAUTH_SETTING_KEYS.clientId, data.clientId.trim()),
    );
  }
  if (data.clientSecret != null && data.clientSecret.trim()) {
    upserts.push(
      upsert(
        GOOGLE_OAUTH_SETTING_KEYS.clientSecret,
        data.clientSecret.trim(),
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
