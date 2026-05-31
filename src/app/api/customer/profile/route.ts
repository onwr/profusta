import { z } from "zod";
import { requireCustomer } from "@/lib/auth/guards";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { db } from "@/lib/db";

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter"),
  phone: z.string().min(10, "Geçerli telefon numarası girin").optional(),
});

export async function GET() {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const profile = await db.user.findUnique({
      where: { id: user!.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        referredByUserId: true,
      },
    });

    if (!profile) return jsonError("Profil bulunamadı", 404);

    return jsonSuccess({ profile });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, error } = await requireCustomer();
    if (error) return error;

    const data = updateProfileSchema.parse(await request.json());

    const profile = await db.user.update({
      where: { id: user!.id },
      data: {
        fullName: data.fullName.trim(),
        phone: data.phone?.trim() || null,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        createdAt: true,
        referredByUserId: true,
      },
    });

    return jsonSuccess({ profile });
  } catch (err) {
    return handleApiError(err);
  }
}
