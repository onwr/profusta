import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireProvider: vi.fn(),
  db: {
    provider: { update: vi.fn() },
    providerFaq: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));

vi.mock("@/lib/auth/guards", () => ({
  requireProvider: mocks.requireProvider,
}));

vi.mock("@/lib/db", () => ({
  db: mocks.db,
}));

describe("PATCH /api/provider/profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireProvider.mockResolvedValue({
      user: { id: "provider-user-1", role: "PROVIDER" },
      error: null,
    });
    mocks.db.provider.update.mockResolvedValue({
      id: "provider-1",
      userId: "provider-user-1",
    });
  });

  it("SSS kayıtlarını temizleyip sıralı şekilde yeniden oluşturur", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/provider/profile", {
        method: "PATCH",
        body: JSON.stringify({
          bio: "  Profesyonel hizmet  ",
          baseCity: "Ankara",
          baseDistrict: "Çankaya",
          serviceRadiusKm: 25,
          faqs: [
            { question: "  Soru 1?  ", answer: "  Cevap 1  " },
            { question: "Soru boş cevap?", answer: "   " },
            { question: "Soru 2?", answer: "Cevap 2" },
          ],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.db.provider.update).toHaveBeenCalledWith({
      where: { userId: "provider-user-1" },
      data: expect.objectContaining({
        bio: "Profesyonel hizmet",
        baseCity: "Ankara",
        baseDistrict: "Çankaya",
        serviceRadiusKm: 25,
      }),
    });
    expect(mocks.db.providerFaq.deleteMany).toHaveBeenCalledWith({
      where: { providerId: "provider-1" },
    });
    expect(mocks.db.providerFaq.createMany).toHaveBeenCalledWith({
      data: [
        {
          providerId: "provider-1",
          question: "Soru 1?",
          answer: "Cevap 1",
          sortOrder: 0,
        },
        {
          providerId: "provider-1",
          question: "Soru 2?",
          answer: "Cevap 2",
          sortOrder: 1,
        },
      ],
    });
  });

  it("tamamı boş SSS gönderilirse eski kayıtları siler ama yeni kayıt oluşturmaz", async () => {
    const { PATCH } = await import("./route");
    const response = await PATCH(
      new Request("http://localhost/api/provider/profile", {
        method: "PATCH",
        body: JSON.stringify({
          faqs: [{ question: "   ", answer: "   " }],
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.db.providerFaq.deleteMany).toHaveBeenCalledWith({
      where: { providerId: "provider-1" },
    });
    expect(mocks.db.providerFaq.createMany).not.toHaveBeenCalled();
  });
});
