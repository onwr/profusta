import { z } from "zod";

export const updateProviderCategoriesSchema = z.object({
  categorySlugs: z
    .array(z.string().min(1))
    .min(1, "En az bir hizmet kategorisi seçin"),
});

export const updateProviderAreasSchema = z.object({
  areas: z
    .array(
      z.object({
        city: z.string().min(1, "İl gerekli"),
        district: z.string().min(1, "İlçe gerekli"),
        radiusKm: z.coerce.number().min(5).max(100).optional(),
      }),
    )
    .min(1, "En az bir hizmet bölgesi seçin"),
  defaultRadiusKm: z.coerce.number().min(5).max(100).optional(),
});

export function areaSelectionKey(city: string, district: string) {
  return `${city.trim()}|${district.trim()}`;
}
