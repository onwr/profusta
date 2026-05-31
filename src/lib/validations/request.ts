import { z } from "zod";

export const createRequestSchema = z.object({
  categoryId: z.string().min(1, "Kategori seçin"),
  serviceId: z.string().optional(),
  description: z.string().min(10, "Açıklama en az 10 karakter olmalı"),
  city: z.string().min(1, "Şehir gerekli"),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  addressDetail: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  targetProviderId: z.string().optional(),
  urgency: z.enum(["normal", "rush", "urgent"]).optional(),
});
