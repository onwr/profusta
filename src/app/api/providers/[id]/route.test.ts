import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  db: {
    provider: { findFirst: vi.fn() },
  },
}));

vi.mock("@/generated/prisma/client", () => ({
  ProviderStatus: { APPROVED: "APPROVED" },
}));

vi.mock("@/lib/db", () => ({
  db: mocks.db,
}));

vi.mock("@/lib/offers/rules", () => ({
  PROVIDER_RATING_PLACEHOLDER: { rating: 4.8, reviewCount: 0 },
}));

describe("GET /api/providers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.db.provider.findFirst.mockResolvedValue({
      id: "provider-1",
      slug: "ahmet-usta",
      bio: "Profesyonel hizmet",
      baseCity: "Ankara",
      baseDistrict: "Çankaya",
      serviceRadiusKm: 25,
      user: { fullName: "Ahmet Usta" },
      categories: [{ categorySlug: "klima-servisi" }],
      serviceAreas: [],
    });
  });

  it("provider kaydını id veya slug ile arar", async () => {
    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "ahmet-usta" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.db.provider.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "APPROVED",
          OR: [{ id: "ahmet-usta" }, { slug: "ahmet-usta" }],
        },
      }),
    );
    expect(body.provider).toEqual(
      expect.objectContaining({
        id: "provider-1",
        slug: "ahmet-usta",
        fullName: "Ahmet Usta",
        categories: ["klima-servisi"],
      }),
    );
  });
});
