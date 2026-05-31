import { describe, expect, it } from "vitest";
import { calcCommission } from "@/lib/settings/commission-calc";

describe("calcCommission", () => {
  it("%10 komisyon", () => {
    const { commissionAmount, netAmount } = calcCommission(1000, 10);
    expect(commissionAmount).toBe(100);
    expect(netAmount).toBe(900);
  });

  it("0 komisyon", () => {
    const { commissionAmount, netAmount } = calcCommission(500, 0);
    expect(commissionAmount).toBe(0);
    expect(netAmount).toBe(500);
  });
});
