import { describe, expect, it } from "vitest";
import { isPublicCallbackUrl } from "@/lib/payments/callback-url";

describe("isPublicCallbackUrl", () => {
  it("localhost reddeder", () => {
    expect(
      isPublicCallbackUrl(
        "http://localhost:3000/api/payments/iyzico/callback",
      ),
    ).toBe(false);
  });

  it("ngrok kabul eder", () => {
    expect(
      isPublicCallbackUrl(
        "https://abc123.ngrok-free.app/api/payments/iyzico/callback",
      ),
    ).toBe(true);
  });
});
