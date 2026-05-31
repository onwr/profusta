import { z } from "zod";

export const createConversationSchema = z.object({
  providerId: z.string().min(1, "Usta seçin"),
  listingId: z.string().optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1, "Mesaj boş olamaz").max(5000),
});

export const createPrivateOfferSchema = z.object({
  title: z
    .string()
    .min(3, "İş adı en az 3 karakter")
    .max(200, "İş adı en fazla 200 karakter"),
  price: z.coerce.number().positive("Fiyat 0'dan büyük olmalı"),
  description: z
    .string()
    .min(10, "Açıklama en az 10 karakter")
    .max(2000, "Açıklama en fazla 2000 karakter"),
  scheduledAt: z.string().optional(),
  durationHours: z.coerce.number().int().positive().max(72).optional(),
  warrantyNote: z.string().max(500).optional(),
});

export const privateOfferActionSchema = z.object({
  action: z.enum(["accept", "reject"]),
});
