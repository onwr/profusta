import { NextResponse } from "next/server";
import { UserRole } from "@/generated/prisma/client";
import { createSessionToken } from "@/lib/auth/create-session";
import { sessionCookieOptions } from "@/lib/auth/cookies";
import { SESSION_COOKIE } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { getRedirectForRole } from "@/lib/auth/session";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { enforceRateLimit } from "@/lib/api/rate-limit-response";
import { db } from "@/lib/db";
import { assertServiceAreaEnabled } from "@/lib/settings/service-areas";
import { registerSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const limited = await enforceRateLimit(request, "auth:register", 10, 3600);
    if (limited) return limited;

    const body = await request.json();
    const data = registerSchema.parse(body);

    const areaCheck = await assertServiceAreaEnabled(data.city, data.district);
    if (!areaCheck.ok) {
      return jsonError(areaCheck.message, 400);
    }

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return jsonError("Bu e-posta adresi zaten kayıtlı", 409);
    }

    let referredByUserId: string | undefined;
    if (data.referredByUserId) {
      const referrer = await db.user.findFirst({
        where: {
          id: data.referredByUserId,
          role: UserRole.CUSTOMER,
          isActive: true,
        },
        select: { id: true },
      });
      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: await hashPassword(data.password),
        fullName: data.fullName.trim(),
        phone: data.phone?.trim(),
        role: UserRole.CUSTOMER,
        referredByUserId,
      },
    });

    const token = await createSessionToken(user);
    const response = jsonSuccess({
      redirect: getRedirectForRole(user.role),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
