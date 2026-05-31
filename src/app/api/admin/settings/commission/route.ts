import { requireAdmin } from "@/lib/auth/guards";
import { handleApiError, jsonSuccess } from "@/lib/api";
import {
  getCommissionRatePercent,
  setCommissionRatePercent,
} from "@/lib/settings/commission";
import { commissionSchema } from "@/lib/validations/order";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const ratePercent = await getCommissionRatePercent();
    return jsonSuccess({ ratePercent });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { ratePercent } = commissionSchema.parse(await request.json());
    await setCommissionRatePercent(ratePercent);
    return jsonSuccess({ ratePercent });
  } catch (err) {
    return handleApiError(err);
  }
}
