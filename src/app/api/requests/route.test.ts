import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireCustomer: vi.fn(),
  db: {
    category: { findUnique: vi.fn() },
    service: { findFirst: vi.fn() },
    provider: { findFirst: vi.fn(), findMany: vi.fn() },
    serviceRequest: { create: vi.fn(), delete: vi.fn() },
    requestImage: { createMany: vi.fn() },
    requestProviderMatch: { createMany: vi.fn() },
    notification: { createMany: vi.fn() },
  },
  matchProvidersForRequest: vi.fn(),
  saveRequestImages: vi.fn(),
  assertServiceAreaEnabled: vi.fn(),
}));

vi.mock("@/generated/prisma/client", () => ({
  NotificationType: { SYSTEM: "SYSTEM" },
  ProviderStatus: { APPROVED: "APPROVED" },
  RequestStatus: { OPEN: "OPEN" },
}));

vi.mock("@/lib/auth/guards", () => ({
  requireCustomer: mocks.requireCustomer,
}));

vi.mock("@/lib/db", () => ({
  db: mocks.db,
}));

vi.mock("@/lib/geo/match-providers", () => ({
  matchProvidersForRequest: mocks.matchProvidersForRequest,
}));

vi.mock("@/lib/upload", () => ({
  saveRequestImages: mocks.saveRequestImages,
}));

vi.mock("@/lib/settings/service-areas", () => ({
  assertServiceAreaEnabled: mocks.assertServiceAreaEnabled,
}));

function makeRequest(data: Record<string, unknown>) {
  const form = new FormData();
  form.append("data", JSON.stringify(data));
  return new Request("http://localhost/api/requests", {
    method: "POST",
    body: form,
  });
}

describe("POST /api/requests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireCustomer.mockResolvedValue({
      user: { id: "customer-1", role: "CUSTOMER" },
      error: null,
    });
    mocks.db.category.findUnique.mockResolvedValue({
      id: "category-1",
      name: "Klima Servisi",
      slug: "klima-servisi",
      isActive: true,
    });
    mocks.assertServiceAreaEnabled.mockResolvedValue({ ok: true });
    mocks.db.serviceRequest.create.mockResolvedValue({
      id: "request-1",
      customerId: "customer-1",
    });
    mocks.saveRequestImages.mockResolvedValue([]);
    mocks.matchProvidersForRequest.mockResolvedValue([
      { providerId: "provider-auto", distanceKm: 3.2 },
    ]);
    mocks.db.provider.findMany.mockResolvedValue([
      { userId: "provider-user-auto" },
      { userId: "provider-user-target" },
    ]);
  });

  it("hedef usta eşleşmede yoksa bile talebe ekler ve bildirim oluşturur", async () => {
    mocks.db.provider.findFirst.mockResolvedValue({
      id: "provider-target",
      baseLatitude: 39.93,
      baseLongitude: 32.85,
    });

    const { POST } = await import("./route");
    const response = await POST(
      makeRequest({
        categoryId: "category-1",
        description: "Klima arızası için servis gerekiyor",
        city: "Ankara",
        district: "Çankaya",
        latitude: 39.9334,
        longitude: 32.8597,
        targetProviderId: "provider-target",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.matchCount).toBe(2);
    expect(mocks.db.requestProviderMatch.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        {
          requestId: "request-1",
          providerId: "provider-auto",
          distanceKm: 3.2,
        },
        expect.objectContaining({
          requestId: "request-1",
          providerId: "provider-target",
        }),
      ]),
    });
    expect(mocks.db.notification.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          userId: "provider-user-target",
          type: "SYSTEM",
          title: "Yeni hizmet talebi",
          link: "/usta/talepler/request-1",
        }),
      ]),
    });
  });

  it("geçersiz hedef usta için talep oluşturmadan 404 döner", async () => {
    mocks.db.provider.findFirst.mockResolvedValue(null);

    const { POST } = await import("./route");
    const response = await POST(
      makeRequest({
        categoryId: "category-1",
        description: "Klima arızası için servis gerekiyor",
        city: "Ankara",
        latitude: 39.9334,
        longitude: 32.8597,
        targetProviderId: "missing-provider",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe("Seçilen usta bulunamadı");
    expect(mocks.db.serviceRequest.create).not.toHaveBeenCalled();
    expect(mocks.db.requestProviderMatch.createMany).not.toHaveBeenCalled();
  });
});
