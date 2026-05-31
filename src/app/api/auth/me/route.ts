import { getCurrentUser } from "@/lib/auth/session";
import { jsonError, jsonSuccess } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Oturum bulunamadı", 401);
  }

  return jsonSuccess({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      providerStatus: user.provider?.status ?? null,
    },
  });
}
