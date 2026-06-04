import { SiteChrome } from "@/components/layout/site-chrome";
import { PageLoader } from "@/components/layout/page-loader";
import { getCurrentUser } from "@/lib/auth/session";
import type { HeaderUser } from "@/lib/auth/header-user";

function toHeaderUser(
  user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>,
): HeaderUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    providerStatus: user.provider?.status ?? null,
  };
}

export async function SiteShell({ children }: { children: React.ReactNode }) {
  let headerUser: HeaderUser | null = null;

  try {
    const user = await getCurrentUser();
    headerUser = user ? toHeaderUser(user) : null;
  } catch (error) {
    console.error("[SiteShell] Oturum okunamadı:", error);
  }

  return (
    <>
      <PageLoader />
      <SiteChrome headerUser={headerUser}>{children}</SiteChrome>
    </>
  );
}
