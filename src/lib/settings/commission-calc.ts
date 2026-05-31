export function calcCommission(amount: number, ratePercent: number) {
  const commissionAmount = Math.round(amount * (ratePercent / 100) * 100) / 100;
  const netAmount = Math.round((amount - commissionAmount) * 100) / 100;
  return { commissionAmount, netAmount };
}
