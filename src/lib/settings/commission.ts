import { db } from "@/lib/db";

export const COMMISSION_SETTING_KEY = "commission_rate_percent";
export const DEFAULT_COMMISSION_RATE = 10;

export async function getCommissionRatePercent(): Promise<number> {
  const row = await db.platformSetting.findUnique({
    where: { key: COMMISSION_SETTING_KEY },
  });
  if (!row) return DEFAULT_COMMISSION_RATE;
  const n = Number(row.value);
  return Number.isFinite(n) && n >= 0 && n <= 100 ? n : DEFAULT_COMMISSION_RATE;
}

export async function setCommissionRatePercent(rate: number) {
  await db.platformSetting.upsert({
    where: { key: COMMISSION_SETTING_KEY },
    create: { key: COMMISSION_SETTING_KEY, value: String(rate) },
    update: { value: String(rate) },
  });
}

export { calcCommission } from "@/lib/settings/commission-calc";
