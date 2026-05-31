import { z } from "zod";
import { optionalTurkishIbanSchema } from "@/lib/validations/iban";

export const createOfferSchema = z.object({
  price: z.coerce.number().positive("Fiyat 0'dan büyük olmalı"),
  description: z.string().min(10, "Açıklama en az 10 karakter"),
  estimatedDuration: z.string().max(100).optional(),
  proposedDate: z.string().optional(),
});

export const updateProviderProfileSchema = z.object({
  bio: z.string().max(1000).optional(),
  iban: optionalTurkishIbanSchema,
  baseCity: z.string().min(1).optional(),
  baseDistrict: z.string().optional(),
  baseLatitude: z.coerce.number().min(-90).max(90).optional(),
  baseLongitude: z.coerce.number().min(-180).max(180).optional(),
  serviceRadiusKm: z.coerce.number().min(5).max(100).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().max(160),
        answer: z.string().trim().max(1000),
      }),
    )
    .max(8)
    .optional(),
});
