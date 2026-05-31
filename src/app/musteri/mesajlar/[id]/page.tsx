import { notFound, redirect } from "next/navigation";
import { MessageCenterShell } from "@/components/messages/message-center-shell";
import { getConversationForUser } from "@/lib/conversations/access";
import { getCurrentUser } from "@/lib/auth/session";
import { ROUTES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function CustomerChatPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(`/giris?redirect=${ROUTES.customer.messages}`);

  const { id } = await params;
  const result = await getConversationForUser(id, user);
  if (!result || !result.isCustomer) notFound();

  return (
    <MessageCenterShell
      role="customer"
      selectedConversationId={id}
      currentUserId={user.id}
      basePath={ROUTES.customer.messages}
    />
  );
}