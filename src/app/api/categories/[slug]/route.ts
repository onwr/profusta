import { handleApiError, jsonError, jsonSuccess } from "@/lib/api";
import { getCategoryBySlug } from "@/lib/categories";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return jsonError("Kategori bulunamadı", 404);
    }
    return jsonSuccess({ category });
  } catch (err) {
    return handleApiError(err);
  }
}
