import { z } from "zod";

export const createListingSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçin"),
  title: z.string().min(5, "Başlık en az 5 karakter"),
  description: z.string().min(20, "Açıklama en az 20 karakter"),
  price: z.coerce.number().positive("Fiyat 0'dan büyük olmalı"),
  city: z.string().min(1, "Şehir gerekli"),
  district: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  serviceRadiusKm: z.coerce.number().min(5).max(100).optional(),
});

export const updateListingSchema = createListingSchema;

export const adminListingActionSchema = z.object({
  action: z.enum(["approve", "reject", "deactivate"]),
  rejectedReason: z.string().optional(),
});
