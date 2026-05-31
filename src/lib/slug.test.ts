import { describe, expect, it } from "vitest";
import { toSlug } from "@/lib/slug";

describe("toSlug", () => {
  it("Türkçe karakterleri URL uyumlu hale getirir", () => {
    expect(toSlug("Çağrı ŞİMŞEK Güzel")).toBe("cagri-simsek-guzel");
  });

  it("boşluk, özel karakter ve çoklu tireleri temizler", () => {
    expect(toSlug("  Usta -- Klima !!! Bakım & Onarım  ")).toBe(
      "usta-klima-bakim-onarim",
    );
  });

  it("slug üretilemeyen isim için boş string döner", () => {
    expect(toSlug("!!!")).toBe("");
  });
});
