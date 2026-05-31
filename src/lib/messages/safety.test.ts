import { describe, expect, it } from "vitest";
import { validateMessageBody } from "@/lib/messages/safety";

describe("validateMessageBody", () => {
  it("normal mesaj geçer", () => {
    expect(validateMessageBody("Merhaba, ne zaman gelebilirsiniz?")).toEqual({
      ok: true,
    });
  });

  it("boş mesaj reddedilir", () => {
    expect(validateMessageBody("   ").ok).toBe(false);
  });

  it("telefon numarası engellenir", () => {
    expect(validateMessageBody("Arayın 0532 123 45 67").ok).toBe(false);
  });

  it("e-posta engellenir", () => {
    expect(validateMessageBody("mail@test.com yazın").ok).toBe(false);
  });

  it("whatsapp engellenir", () => {
    expect(validateMessageBody("whatsapp üzerinden yazın").ok).toBe(false);
  });

  it("iban / havale engellenir", () => {
    expect(validateMessageBody("IBAN ile havale yapın").ok).toBe(false);
  });

  it("sosyal medya engellenir", () => {
    expect(validateMessageBody("instagram @usta_pro").ok).toBe(false);
  });
});
