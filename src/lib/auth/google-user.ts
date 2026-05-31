import { UserRole, type Provider, type User } from "@/generated/prisma/client";
import type { GoogleProfile } from "@/lib/auth/google";
import type { GoogleOAuthIntent } from "@/lib/auth/google-state";
import { GoogleAuthError } from "@/lib/auth/google-auth-error";
import { db } from "@/lib/db";

export { GoogleAuthError };

async function resolveReferrerId(ref?: string): Promise<string | undefined> {
  if (!ref?.trim()) return undefined;
  const referrer = await db.user.findFirst({
    where: {
      id: ref.trim(),
      role: UserRole.CUSTOMER,
      isActive: true,
    },
    select: { id: true },
  });
  return referrer?.id;
}

function assertUserCanLogin(
  user: User & { provider?: Provider | null },
): void {
  if (!user.isActive) {
    throw new GoogleAuthError(
      "Hesabınız devre dışı bırakılmıştır.",
      "account_inactive",
    );
  }
  if (user.role === UserRole.PROVIDER && user.provider?.status === "SUSPENDED") {
    throw new GoogleAuthError(
      "Hesabınız askıya alınmıştır. Destek ile iletişime geçin.",
      "provider_suspended",
    );
  }
}

export async function resolveGoogleUser(
  profile: GoogleProfile,
  intent: GoogleOAuthIntent,
  ref?: string,
): Promise<User & { provider?: Provider | null }> {
  if (!profile.email || !profile.sub) {
    throw new GoogleAuthError(
      "Google hesap bilgileri alınamadı.",
      "invalid_profile",
    );
  }

  const byGoogle = await db.user.findUnique({
    where: { googleSub: profile.sub },
    include: { provider: true },
  });
  if (byGoogle) {
    assertUserCanLogin(byGoogle);
    return byGoogle;
  }

  const byEmail = await db.user.findUnique({
    where: { email: profile.email },
    include: { provider: true },
  });

  if (byEmail) {
    assertUserCanLogin(byEmail);
    const updates: {
      googleSub: string;
      avatarUrl?: string;
    } = { googleSub: profile.sub };
    if (profile.picture && !byEmail.avatarUrl) {
      updates.avatarUrl = profile.picture;
    }
    return db.user.update({
      where: { id: byEmail.id },
      data: updates,
      include: { provider: true },
    });
  }

  if (intent === "login") {
    throw new GoogleAuthError(
      "Bu e-posta ile kayıtlı hesap bulunamadı. Önce kayıt olun.",
      "need_register",
    );
  }

  const referredByUserId = await resolveReferrerId(ref);

  return db.user.create({
    data: {
      email: profile.email,
      googleSub: profile.sub,
      fullName: profile.fullName,
      avatarUrl: profile.picture,
      role: UserRole.CUSTOMER,
      passwordHash: null,
      referredByUserId,
    },
    include: { provider: true },
  });
}
