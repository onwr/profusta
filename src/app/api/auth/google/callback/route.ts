import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken } from "@/lib/auth/create-session";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { exchangeGoogleCode } from "@/lib/auth/google";
import {
  googleErrorCodeFromError,
  redirectWithGoogleError,
} from "@/lib/auth/google-errors";
import {
  GOOGLE_STATE_COOKIE,
  verifyGoogleOAuthState,
} from "@/lib/auth/google-state";
import { resolveGoogleUser } from "@/lib/auth/google-user";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { getRedirectForRole } from "@/lib/auth/session";
import { enforceRateLimit } from "@/lib/api/rate-limit-response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? url.origin).replace(
    /\/+$/,
    "",
  );
  const oauthError = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(GOOGLE_STATE_COOKIE)?.value;

  const clearState = (response: NextResponse) => {
    response.cookies.set(GOOGLE_STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  };

  let intent: "login" | "register" = "login";

  try {
    const limited = await enforceRateLimit(request, "auth:google", 30, 60);
    if (limited) {
      const response = NextResponse.redirect(
        `${baseUrl}/giris?error=${encodeURIComponent("google_auth_failed")}`,
      );
      return clearState(response);
    }

    if (oauthError || !code || !stateParam) {
      throw new Error("Google authorization denied");
    }

    if (!stateCookie || stateCookie !== stateParam) {
      const response = NextResponse.redirect(
        redirectWithGoogleError("login", "google_state_invalid", baseUrl),
      );
      return clearState(response);
    }

    const state = await verifyGoogleOAuthState(stateCookie);
    if (!state) {
      const response = NextResponse.redirect(
        redirectWithGoogleError("login", "google_state_invalid", baseUrl),
      );
      return clearState(response);
    }

    intent = state.intent;

    const profile = await exchangeGoogleCode(code);
    const user = await resolveGoogleUser(profile, state.intent, state.ref);

    const token = await createSessionToken(user);
    const roleRedirect = getRedirectForRole(user.role, user.provider?.status);
    const redirectTo = state.returnTo || roleRedirect;

    const response = NextResponse.redirect(`${baseUrl}${redirectTo}`, 303);
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return clearState(response);
  } catch (err) {
    const code = googleErrorCodeFromError(err);
    const response = NextResponse.redirect(
      redirectWithGoogleError(intent, code, baseUrl),
    );
    return clearState(response);
  }
}
