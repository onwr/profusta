import { describe, expect, it } from "vitest";
import { getReadStatusLabel } from "@/lib/messages/read-status";

describe("getReadStatusLabel", () => {
  it("okunmamış mesaj", () => {
    expect(getReadStatusLabel(null).label).toBe("İletildi");
    expect(getReadStatusLabel(null).isRead).toBe(false);
  });

  it("okunmuş mesaj", () => {
    const result = getReadStatusLabel("2026-05-19T12:00:00.000Z");
    expect(result.isRead).toBe(true);
    expect(result.label).toContain("Okundu");
  });
});
