import { describe, expect, it, vi } from "vitest";
import { createUniqueProviderSlug } from "@/lib/providers/slug";

describe("createUniqueProviderSlug", () => {
  it("benzersiz isim için temel slug döner", async () => {
    const db = {
      provider: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    await expect(createUniqueProviderSlug(db, "Ahmet Usta")).resolves.toBe(
      "ahmet-usta",
    );
    expect(db.provider.findUnique).toHaveBeenCalledWith({
      where: { slug: "ahmet-usta" },
      select: { id: true },
    });
  });

  it("çakışma varsa sıradaki suffix ile benzersiz slug üretir", async () => {
    const db = {
      provider: {
        findUnique: vi
          .fn()
          .mockResolvedValueOnce({ id: "provider-1" })
          .mockResolvedValueOnce({ id: "provider-2" })
          .mockResolvedValueOnce(null),
      },
    };

    await expect(createUniqueProviderSlug(db, "Ahmet Usta")).resolves.toBe(
      "ahmet-usta-3",
    );
    expect(db.provider.findUnique).toHaveBeenNthCalledWith(2, {
      where: { slug: "ahmet-usta-2" },
      select: { id: true },
    });
  });

  it("mevcut provider kendi slug değerini koruyabilir", async () => {
    const db = {
      provider: {
        findUnique: vi.fn().mockResolvedValue({ id: "provider-current" }),
      },
    };

    await expect(
      createUniqueProviderSlug(db, "Ahmet Usta", "provider-current"),
    ).resolves.toBe("ahmet-usta");
  });
});
