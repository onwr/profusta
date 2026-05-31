import { createSessionToken } from "@/lib/auth/create-session";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { getRedirectForRole } from "@/lib/auth/session";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { enforceRateLimit } from "@/lib/api/rate-limit-response";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "auth:login", 20, 60);
    if (limited) return limited;

    const body = await request.json();
    const data = loginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: { provider: true },
    });

    if (!user || !user.isActive) {
      return jsonError("E-posta veya şifre hatalı", 401);
    }

    if (!user.passwordHash) {
      return jsonError(
        "Bu hesap Google ile oluşturuldu. Lütfen Google ile giriş yapın.",
        401,
      );
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return jsonError("E-posta veya şifre hatalı", 401);
    }

    if (user.role === "PROVIDER" && user.provider?.status === "SUSPENDED") {
      return jsonError("Hesabınız askıya alınmıştır. Destek ile iletişime geçin.", 403);
    }

    const token = await createSessionToken(user);
    const redirect = getRedirectForRole(user.role, user.provider?.status);

    const response = jsonSuccess({
      redirect,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        providerStatus: user.provider?.status ?? null,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
