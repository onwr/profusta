import { SESSION_COOKIE } from "@/lib/auth/jwt";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 gün
};

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    ...sessionCookieOptions,
    maxAge: 0,
  };
}
