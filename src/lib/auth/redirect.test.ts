import { describe, expect, it } from "vitest";
import { getRedirectForRole } from "@/lib/auth/redirect";

describe("getRedirectForRole", () => {
  it("admin → /admin", () => {
    expect(getRedirectForRole("ADMIN")).toBe("/admin");
  });

  it("onaylı usta → /usta", () => {
    expect(getRedirectForRole("PROVIDER", "APPROVED")).toBe("/usta");
  });

  it("bekleyen usta → beklemede", () => {
    expect(getRedirectForRole("PROVIDER", "PENDING")).toBe(
      "/usta-basvuru/beklemede",
    );
  });

  it("müşteri → /musteri", () => {
    expect(getRedirectForRole("CUSTOMER")).toBe("/musteri");
  });
});
