import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySession, type SessionPayload } from "@/lib/auth/jwt";
export { getRedirectForRole } from "@/lib/auth/redirect";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.sub },
    include: { provider: true },
  });

  if (!user || !user.isActive) return null;
  return user;
}

