import { SignJWT, jwtVerify } from "jose";
import type { ProviderStatus, UserRole } from "@/generated/prisma/client";

export const SESSION_COOKIE = "profusta_session";

export type SessionPayload = {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  providerStatus?: ProviderStatus | null;
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET en az 32 karakter olmalıdır.");
  }
  return new TextEncoder().encode(secret);
}

function parseExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN ?? "7d";
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
    fullName: payload.fullName,
    providerStatus: payload.providerStatus ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(parseExpiresIn())
    .sign(getSecret());
}

export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string") return null;

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role as UserRole,
      fullName:
        typeof payload.fullName === "string" ? payload.fullName : "",
      providerStatus: (payload.providerStatus as ProviderStatus) ?? null,
    };
  } catch {
    return null;
  }
}
