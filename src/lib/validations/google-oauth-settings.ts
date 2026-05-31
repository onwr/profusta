import { z } from "zod";

export const googleOAuthSettingsPatchSchema = z.object({
  clientId: z.string().min(1, "Client ID gerekli"),
  clientSecret: z.string().optional(),
});

export type GoogleOAuthSettingsPatchInput = z.infer<
  typeof googleOAuthSettingsPatchSchema
>;
