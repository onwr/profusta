import { sessionCookieOptions } from "@/lib/auth/cookies";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { jsonSuccess } from "@/lib/api";

export async function POST() {
  const response = jsonSuccess({ redirect: "/" });
  response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
  return response;
}
