import { createHash, randomBytes } from "crypto";
import { handleApiError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Güvenlik: kullanıcı yoksa veya OAuth-only ise aynı mesaj
    if (user?.passwordHash) {
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

      await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await db.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      if (process.env.NODE_ENV === "development") {
        const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        console.log("[dev] Şifre sıfırlama linki:", `${base}/sifre-sifirla?token=${rawToken}`);
      }
    }

    return jsonSuccess({
      message:
        "E-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
