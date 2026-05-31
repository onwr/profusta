import { z } from "zod";
import { optionalTurkishIbanSchema } from "@/lib/validations/iban";
import { turkishPhoneSchema } from "@/lib/validations/phone";

export const loginSchema = z.object({
  email: z.email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, "Ad soyad en az 2 karakter"),
  email: z.email("Geçerli bir e-posta girin"),
  phone: z.string().min(10, "Geçerli telefon numarası girin").optional(),
  password: z
    .string()
    .min(8, "Şifre en az 8 karakter")
    .regex(/[A-Za-z]/, "Şifre en az bir harf içermeli")
    .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
  city: z.string().min(1, "İl seçin"),
  district: z.string().min(1, "İlçe seçin"),
  referredByUserId: z.string().optional(),
});

export const providerRegisterSchema = registerSchema
  .omit({ city: true, district: true, phone: true })
  .extend({
  phone: turkishPhoneSchema,
  bio: z.string().max(1000).optional(),
  iban: optionalTurkishIbanSchema,
  baseCity: z.string().min(1, "İl seçin"),
  baseDistrict: z.string().min(1, "İlçe seçin"),
  serviceRadiusKm: z.coerce.number().min(5).max(100).default(20),
  categories: z
    .array(z.string())
    .min(1, "En az bir kategori seçin"),
  serviceAreas: z
    .array(
      z.object({
        city: z.string().min(1),
        district: z.string().min(1),
      }),
    )
    .min(1, "En az bir hizmet bölgesi ekleyin"),
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Geçerli bir e-posta girin"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: registerSchema.shape.password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProviderRegisterInput = z.infer<typeof providerRegisterSchema>;
