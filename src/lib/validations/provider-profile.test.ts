import { describe, expect, it } from "vitest";
import { updateProviderProfileSchema } from "@/lib/validations/offer";

describe("updateProviderProfileSchema faqs", () => {
  it("SSS soru ve cevaplarını trimler", () => {
    const parsed = updateProviderProfileSchema.parse({
      faqs: [{ question: "  Nasıl çalışır?  ", answer: "  Detaylı cevap  " }],
    });

    expect(parsed.faqs).toEqual([
      { question: "Nasıl çalışır?", answer: "Detaylı cevap" },
    ]);
  });

  it("en fazla 8 SSS kabul eder", () => {
    const faqs = Array.from({ length: 9 }, (_, index) => ({
      question: `Soru ${index + 1}`,
      answer: "Cevap",
    }));

    expect(() => updateProviderProfileSchema.parse({ faqs })).toThrow();
  });

  it("soru ve cevap uzunluk limitlerini uygular", () => {
    expect(() =>
      updateProviderProfileSchema.parse({
        faqs: [{ question: "a".repeat(161), answer: "Cevap" }],
      }),
    ).toThrow();

    expect(() =>
      updateProviderProfileSchema.parse({
        faqs: [{ question: "Soru", answer: "a".repeat(1001) }],
      }),
    ).toThrow();
  });
});
