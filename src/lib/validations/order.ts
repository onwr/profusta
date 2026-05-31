import { z } from "zod";

export const createOrderSchema = z.object({
  sourceType: z.enum(["REQUEST_OFFER", "PRIVATE_OFFER", "LISTING"]),
  sourceId: z.string().min(1),
});

export const payoutSchema = z.object({
  amount: z.coerce.number().positive("Tutar 0'dan büyük olmalı"),
});

export const commissionSchema = z.object({
  ratePercent: z.coerce.number().min(0).max(100),
});
