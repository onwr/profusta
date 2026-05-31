import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getGoogleAuthorizationUrl } from "@/lib/auth/google";
import {
  GOOGLE_STATE_COOKIE,
  sanitizeReturnTo,
  signGoogleOAuthState,
  type GoogleOAuthIntent,
} from "@/lib/auth/google-state";
import { googleErrorCodeFromError, redirectWithGoogleError } from "@/lib/auth/google-errors";

const stateCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

function parseIntent(value: string | null): GoogleOAuthIntent {
  return value === "register" ? "register" : "login";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const intent = parseIntent(url.searchParams.get("intent"));
  const returnTo = sanitizeReturnTo(url.searchParams.get("returnTo"));
  const ref = url.searchParams.get("ref")?.trim() || undefined;
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? url.origin).replace(
    /\/+$/,
    "",
  );

  try {
    const nonce = randomBytes(16).toString("hex");
    const state = await signGoogleOAuthState({
      intent,
      returnTo,
      ref,
      nonce,
    });

    const authUrl = await getGoogleAuthorizationUrl(state);
    const response = NextResponse.redirect(authUrl);
    response.cookies.set(GOOGLE_STATE_COOKIE, state, stateCookieOptions);
    return response;
  } catch (err) {
    const code = googleErrorCodeFromError(err);
    return NextResponse.redirect(redirectWithGoogleError(intent, code, baseUrl));
  }
}
