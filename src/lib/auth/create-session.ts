import type { ProviderStatus, User } from "@/generated/prisma/client";
import { signSession } from "@/lib/auth/jwt";

export async function createSessionToken(
  user: User & { provider?: { status: ProviderStatus } | null },
) {
  return signSession({
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    providerStatus: user.provider?.status ?? null,
  });
}
