import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter"),
  slug: z.string().min(2).optional(),
  icon: z.string().optional(),
  coverImageUrl: z.string().max(500).optional().nullable(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const serviceCreateSchema = z.object({
  categoryId: z.string().min(1),
  name: z.string().min(2, "Hizmet adı en az 2 karakter"),
  slug: z.string().min(2).optional(),
  description: z.string().optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const serviceUpdateSchema = serviceCreateSchema
  .omit({ categoryId: true })
  .partial();
