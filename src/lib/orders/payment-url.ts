import { ROUTES } from "@/lib/constants";

export function paymentUrlForOrder(orderId: string) {
  return ROUTES.payment(orderId);
}
