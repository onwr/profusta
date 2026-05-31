import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  sanitizeReturnTo,
  signGoogleOAuthState,
  verifyGoogleOAuthState,
} from "@/lib/auth/google-state";

describe("google-state", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret-minimum-32-characters-long";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("sanitizeReturnTo güvenli path kabul eder", () => {
    expect(sanitizeReturnTo("/musteri")).toBe("/musteri");
    expect(sanitizeReturnTo("//evil.com")).toBe("");
    expect(sanitizeReturnTo("https://evil.com")).toBe("");
  });

  it("imzalı state doğrulanır", async () => {
    const token = await signGoogleOAuthState({
      intent: "login",
      returnTo: "/musteri",
      ref: "ref-1",
      nonce: "abc",
    });

    const verified = await verifyGoogleOAuthState(token);
    expect(verified).toEqual({
      intent: "login",
      returnTo: "/musteri",
      ref: "ref-1",
      nonce: "abc",
    });
  });

  it("bozuk state reddedilir", async () => {
    expect(await verifyGoogleOAuthState("invalid.token.value")).toBeNull();
  });
});
