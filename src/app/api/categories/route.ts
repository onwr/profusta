import { handleApiError, jsonSuccess } from "@/lib/api";
import { getActiveCategories } from "@/lib/categories";

export async function GET() {
  try {
    const categories = await getActiveCategories();
    return jsonSuccess({ categories });
  } catch (err) {
    return handleApiError(err);
  }
}
