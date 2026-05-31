import { describe, expect, it } from "vitest";
import {
  PaymentBuyerInfoError,
  isValidTurkishIdentityNumber,
  normalizeTurkishIdentityNumber,
  normalizeTurkishPhone,
  resolvePaymentBuyerInfo,
} from "@/lib/payments/buyer-info";

const SANDBOX_CTX = {
  isSandbox: true,
  sandboxDefaultIdentity: "11111111111",
};

const PRODUCTION_CTX = {
  isSandbox: false,
  sandboxDefaultIdentity: "",
};

describe("buyer-info", () => {
  it("normalizeTurkishPhone geçerli numaralar", () => {
    expect(normalizeTurkishPhone("05321234567")).toBe("+905321234567");
    expect(normalizeTurkishPhone("+90 532 123 45 67")).toBe("+905321234567");
    expect(normalizeTurkishPhone("5321234567")).toBe("+905321234567");
  });

  it("normalizeTurkishPhone sahte fallback kullanmaz", () => {
    expect(() => normalizeTurkishPhone(null)).toThrow(PaymentBuyerInfoError);
    expect(() => normalizeTurkishPhone("123")).toThrow(PaymentBuyerInfoError);
    expect(() => normalizeTurkishPhone("02121234567")).toThrow(
      PaymentBuyerInfoError,
    );
  });

  it("isValidTurkishIdentityNumber algoritma kontrolü", () => {
    expect(isValidTurkishIdentityNumber("11111111110")).toBe(true);
    expect(isValidTurkishIdentityNumber("11111111111")).toBe(false);
  });

  it("normalizeTurkishIdentityNumber geçerli TC kabul eder", () => {
    expect(normalizeTurkishIdentityNumber("11111111110")).toBe("11111111110");
  });

  it("sandbox ortamında admin test kimliği kullanılabilir", () => {
    expect(
      resolvePaymentBuyerInfo({
        phone: "05321234567",
        identityNumber: undefined,
        iyzico: SANDBOX_CTX,
      }),
    ).toEqual({
      gsmNumber: "+905321234567",
      identityNumber: "11111111111",
    });
  });

  it("production ortamında kimlik zorunlu", () => {
    expect(() =>
      resolvePaymentBuyerInfo({
        phone: "05321234567",
        identityNumber: undefined,
        iyzico: PRODUCTION_CTX,
      }),
    ).toThrow("TC kimlik numaranız gereklidir");
  });
});
