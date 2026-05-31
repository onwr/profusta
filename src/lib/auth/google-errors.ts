import { ROUTES } from "@/lib/constants";
import { GoogleAuthError } from "@/lib/auth/google-auth-error";
import type { GoogleOAuthIntent } from "@/lib/auth/google-state";

export { getGoogleAuthErrorMessage } from "@/lib/auth/google-error-messages";

export function authPageForIntent(intent: GoogleOAuthIntent): string {
  return intent === "register" ? ROUTES.register : ROUTES.login;
}

export function redirectWithGoogleError(
  intent: GoogleOAuthIntent,
  code: string,
  baseUrl: string,
): string {
  const page = authPageForIntent(intent);
  return `${baseUrl}${page}?error=${encodeURIComponent(code)}`;
}

export function googleErrorCodeFromError(err: unknown): string {
  if (err instanceof GoogleAuthError) {
    switch (err.code) {
      case "need_register":
        return "google_need_register";
      case "account_inactive":
        return "google_account_inactive";
      case "provider_suspended":
        return "google_provider_suspended";
      default:
        return "google_auth_failed";
    }
  }
  if (err instanceof Error && err.message.includes("yapılandırması eksik")) {
    return "google_config";
  }
  return "google_auth_failed";
}
