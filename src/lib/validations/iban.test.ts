import { describe, expect, it } from "vitest";
import {
  formatIbanDisplay,
  isValidTurkishIban,
  normalizeIban,
  sanitizeIbanInput,
  TURKISH_IBAN_REGEX,
} from "./iban";

describe("iban", () => {
  it("normalizes and formats TR IBAN", () => {
    const raw = "tr330006100519786457841326";
    expect(normalizeIban(raw)).toBe("TR330006100519786457841326");
    expect(TURKISH_IBAN_REGEX.test(normalizeIban(raw))).toBe(true);
    expect(formatIbanDisplay(raw)).toBe("TR33 0006 1005 1978 6457 8413 26");
  });

  it("validates mod-97 checksum", () => {
    expect(isValidTurkishIban("TR330006100519786457841326")).toBe(true);
    expect(isValidTurkishIban("TR000000000000000000000000")).toBe(false);
  });

  it("sanitize enforces TR prefix and length", () => {
    expect(sanitizeIbanInput("330006100519786457841326")).toMatch(/^TR33/);
    expect(normalizeIban(sanitizeIbanInput("330006100519786457841326"))).toHaveLength(
      26,
    );
  });
});
