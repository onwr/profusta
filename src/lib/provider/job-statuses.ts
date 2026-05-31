export const PROVIDER_ACTIVE_STATUSES = [
  "PAID_ESCROW",
  "PROVIDER_ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED_BY_PROVIDER",
  "DISPUTED",
] as const;

export const PROVIDER_COMPLETED_STATUSES = [
  "COMPLETED",
  "PAYOUT_PENDING",
  "PAYOUT_COMPLETED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type ProviderActiveStatus = (typeof PROVIDER_ACTIVE_STATUSES)[number];
export type ProviderCompletedStatus =
  (typeof PROVIDER_COMPLETED_STATUSES)[number];

export function isProviderActiveStatus(status: string): boolean {
  return (PROVIDER_ACTIVE_STATUSES as readonly string[]).includes(status);
}

export function isProviderCompletedStatus(status: string): boolean {
  return (PROVIDER_COMPLETED_STATUSES as readonly string[]).includes(status);
}
