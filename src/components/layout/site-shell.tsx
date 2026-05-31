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
  const user = await getCurrentUser();
  const headerUser = user ? toHeaderUser(user) : null;

  return (
    <>
      <PageLoader />
      <SiteChrome headerUser={headerUser}>{children}</SiteChrome>
    </>
  );
}
