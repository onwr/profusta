import { redirect } from "next/navigation";
import { MessageCenterShell } from "@/components/messages/message-center-shell";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CustomerMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/giris?redirect=${ROUTES.customer.messages}`);

  return (
    <MessageCenterShell
      role="customer"
      currentUserId={user.id}
      basePath={ROUTES.customer.messages}
    />
  );
}