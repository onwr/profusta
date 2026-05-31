import { describe, expect, it } from "vitest";
import {
  amountToKurus,
  formatGsmNumber,
  formatPriceTl,
  splitBuyerName,
} from "@/lib/payments/iyzico";

describe("iyzico helpers", () => {
  it("formatPriceTl iyzico formatı", () => {
    expect(formatPriceTl(2500)).toBe("2500.0");
    expect(formatPriceTl(99.5)).toBe("99.5");
  });

  it("amountToKurus", () => {
    expect(amountToKurus(10.5)).toBe(1050);
  });

  it("splitBuyerName", () => {
    expect(splitBuyerName("Ali Veli")).toEqual({ name: "Ali", surname: "Veli" });
    expect(splitBuyerName("Tek")).toEqual({ name: "Tek", surname: "." });
  });

  it("formatGsmNumber", () => {
    expect(formatGsmNumber("05321234567")).toBe("+905321234567");
    expect(() => formatGsmNumber("")).toThrow();
  });
});
