import { z } from "zod";

export const cancelOrderSchema = z.object({
  reason: z.string().min(10, "Sebep en az 10 karakter").max(2000),
});

export const adminRefundActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  refundAmount: z.coerce.number().positive().optional(),
  adminNote: z.string().optional(),
});
