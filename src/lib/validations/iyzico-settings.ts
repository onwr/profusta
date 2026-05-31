import { z } from "zod";

export const iyzicoSettingsPatchSchema = z.object({
  apiKey: z.string().min(1, "API anahtarı gerekli"),
  secretKey: z.string().optional(),
  baseUrl: z
    .string()
    .url("Geçerli bir API adresi girin")
    .refine(
      (url) =>
        url.includes("iyzipay.com") || url.includes("iyzico"),
      "İyzico API adresi olmalıdır",
    ),
  callbackUrl: z.string().url("Geçerli bir callback URL girin"),
  defaultIdentity: z
    .string()
    .optional()
    .transform((v) => (v ?? "").replace(/\D/g, ""))
    .refine(
      (v) => v === "" || /^[1-9][0-9]{10}$/.test(v),
      "Test kimlik numarası 11 haneli olmalıdır",
    ),
});

export type IyzicoSettingsPatchInput = z.infer<typeof iyzicoSettingsPatchSchema>;
