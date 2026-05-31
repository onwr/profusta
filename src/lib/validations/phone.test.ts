import { describe, expect, it } from "vitest";
import {
  formatTurkishPhoneDisplay,
  isValidTurkishPhone,
  normalizeTurkishPhone,
} from "@/lib/validations/phone";

describe("phone validation", () => {
  it("formats mobile display", () => {
    expect(formatTurkishPhoneDisplay("05411961830")).toBe("0541 196 18 30");
  });

  it("normalizes +90 prefix", () => {
    expect(normalizeTurkishPhone("+90 541 196 18 30")).toBe("05411961830");
  });

  it("validates Turkish mobile", () => {
    expect(isValidTurkishPhone("0541 196 18 30")).toBe(true);
    expect(isValidTurkishPhone("02121234567")).toBe(false);
  });
});
