import {
  OrderStatus,
  RefundScenario,
  type Order,
} from "@/generated/prisma/client";

export type CancelEvaluation = {
  autoRefund: boolean;
  scenario: RefundScenario;
  requiresAdmin: boolean;
  error?: string;
};

export function evaluateCustomerCancel(order: Order): CancelEvaluation {
  if (
    order.status === OrderStatus.COMPLETED ||
    order.status === OrderStatus.COMPLETED_BY_PROVIDER
  ) {
    return {
      autoRefund: false,
      scenario: RefundScenario.IN_PROGRESS,
      requiresAdmin: false,
      error: "Tamamlanan iş için iptal yerine itiraz açın",
    };
  }

  if (
    order.status === OrderStatus.CANCELLED ||
    order.status === OrderStatus.REFUNDED ||
    order.status === OrderStatus.DISPUTED
  ) {
    return {
      autoRefund: false,
      scenario: RefundScenario.PRE_ACCEPT,
      requiresAdmin: false,
      error: "Bu sipariş zaten sonuçlandırılmış",
    };
  }

  if (order.status === OrderStatus.PAID_ESCROW) {
    return {
      autoRefund: true,
      scenario: RefundScenario.PRE_ACCEPT,
      requiresAdmin: false,
    };
  }

  if (
    order.status === OrderStatus.PROVIDER_ACCEPTED ||
    order.status === OrderStatus.IN_PROGRESS
  ) {
    return {
      autoRefund: false,
      scenario:
        order.status === OrderStatus.IN_PROGRESS
          ? RefundScenario.IN_PROGRESS
          : RefundScenario.AFTER_ACCEPT,
      requiresAdmin: true,
    };
  }

  return {
    autoRefund: false,
    scenario: RefundScenario.PRE_ACCEPT,
    requiresAdmin: false,
    error: "Bu durumda iptal yapılamaz",
  };
}

export function canProviderCancel(order: Order): { ok: boolean; error?: string } {
  const allowed: OrderStatus[] = [
    OrderStatus.PAID_ESCROW,
    OrderStatus.PROVIDER_ACCEPTED,
    OrderStatus.IN_PROGRESS,
  ];
  if (!allowed.includes(order.status)) {
    return { ok: false, error: "Bu sipariş usta tarafından iptal edilemez" };
  }
  return { ok: true };
}

export function canOpenDispute(order: Order): { ok: boolean; error?: string } {
  const allowed: OrderStatus[] = [
    OrderStatus.COMPLETED_BY_PROVIDER,
    OrderStatus.COMPLETED,
  ];
  if (!allowed.includes(order.status)) {
    return {
      ok: false,
      error: "İtiraz yalnızca tamamlanan veya onay bekleyen işler için açılabilir",
    };
  }
  if (order.status === OrderStatus.DISPUTED) {
    return { ok: false, error: "Bu sipariş için zaten itiraz var" };
  }
  return { ok: true };
}
