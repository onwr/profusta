import { createHash } from "crypto";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const record = await db.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return jsonError("Geçersiz veya süresi dolmuş bağlantı", 400);
    }

    await db.$transaction([
      db.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(password) },
      }),
      db.passwordResetToken.delete({ where: { id: record.id } }),
    ]);

    return jsonSuccess({
      message: "Şifreniz güncellendi. Giriş yapabilirsiniz.",
      redirect: "/giris",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
