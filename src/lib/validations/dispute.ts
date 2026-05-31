import { z } from "zod";

export const createDisputeSchema = z.object({
  description: z.string().min(20, "Açıklama en az 20 karakter").max(5000),
});

export const providerMessageSchema = z.object({
  message: z.string().min(10, "Mesaj en az 10 karakter").max(5000),
});

export const providerResubmitSchema = z.object({
  message: z.string().min(20, "Düzeltme özeti en az 20 karakter").max(5000),
});

export const adminDisputeActionSchema = z.object({
  action: z.enum([
    "full_refund",
    "partial_refund",
    "release_to_provider",
    "reject",
  ]),
  refundAmount: z.coerce.number().positive().optional(),
  adminNote: z.string().optional(),
});
