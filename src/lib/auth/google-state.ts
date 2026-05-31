import { SignJWT, jwtVerify } from "jose";

export const GOOGLE_STATE_COOKIE = "profusta_google_oauth_state";

export type GoogleOAuthIntent = "login" | "register";

export type GoogleOAuthState = {
  intent: GoogleOAuthIntent;
  returnTo: string;
  ref?: string;
  nonce: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET en az 32 karakter olmalıdır.");
  }
  return new TextEncoder().encode(secret);
}

export function sanitizeReturnTo(returnTo: string | null | undefined): string {
  if (!returnTo?.trim()) return "";
  const path = returnTo.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "";
  if (path.includes("://")) return "";
  return path;
}

export async function signGoogleOAuthState(
  payload: GoogleOAuthState,
): Promise<string> {
  return new SignJWT({
    intent: payload.intent,
    returnTo: payload.returnTo,
    ref: payload.ref ?? null,
    nonce: payload.nonce,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(getSecret());
}

export async function verifyGoogleOAuthState(
  token: string,
): Promise<GoogleOAuthState | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const intent = payload.intent;
    if (intent !== "login" && intent !== "register") return null;

    return {
      intent,
      returnTo: sanitizeReturnTo(
        typeof payload.returnTo === "string" ? payload.returnTo : "",
      ),
      ref:
        typeof payload.ref === "string" && payload.ref.trim()
          ? payload.ref.trim()
          : undefined,
      nonce: typeof payload.nonce === "string" ? payload.nonce : "",
    };
  } catch {
    return null;
  }
}
