import { OAuth2Client } from "google-auth-library";
import {
  getGoogleOAuthRedirectUri,
  getGoogleOAuthSettings,
} from "@/lib/settings/google-oauth";

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  fullName: string;
  picture: string | null;
};

export async function getGoogleOAuthConfig() {
  const settings = await getGoogleOAuthSettings();
  if (!settings.clientId || !settings.clientSecret) {
    throw new Error(
      "Google OAuth yapılandırması eksik — Admin panelinden Google giriş ayarlarını tamamlayın.",
    );
  }
  return {
    clientId: settings.clientId,
    clientSecret: settings.clientSecret,
  };
}

export function getGoogleRedirectUri(): string {
  return getGoogleOAuthRedirectUri();
}

export async function createGoogleOAuthClient(): Promise<OAuth2Client> {
  const { clientId, clientSecret } = await getGoogleOAuthConfig();
  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getGoogleRedirectUri(),
  });
}

export async function getGoogleAuthorizationUrl(state: string): Promise<string> {
  const client = await createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "online",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state,
  });
}

export async function exchangeGoogleCode(code: string): Promise<GoogleProfile> {
  const client = await createGoogleOAuthClient();
  const { clientId } = await getGoogleOAuthConfig();
  const { tokens } = await client.getToken(code);

  if (!tokens.id_token) {
    throw new Error("Google kimlik bilgisi alınamadı");
  }

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new Error("Google profil bilgisi eksik");
  }

  if (payload.email_verified === false) {
    throw new Error("Google e-posta adresi doğrulanmamış");
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase(),
    emailVerified: payload.email_verified ?? true,
    fullName:
      payload.name?.trim() ||
      payload.given_name?.trim() ||
      payload.email.split("@")[0],
    picture: payload.picture ?? null,
  };
}
