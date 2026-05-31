import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  requireCustomer: vi.fn(),
  db: {
    conversation: { findMany: vi.fn(), upsert: vi.fn() },
    message: { count: vi.fn() },
    provider: { findFirst: vi.fn(), findUnique: vi.fn() },
    listing: { findFirst: vi.fn() },
    order: { count: vi.fn() },
    review: { findMany: vi.fn() },
  },
}));

vi.mock("@/generated/prisma/client", () => ({
  ListingStatus: { ACTIVE: "ACTIVE" },
  ProviderStatus: { APPROVED: "APPROVED" },
  OrderStatus: {
    COMPLETED: "COMPLETED",
    PAYOUT_PENDING: "PAYOUT_PENDING",
    PAYOUT_COMPLETED: "PAYOUT_COMPLETED",
  },
}));

vi.mock("@/lib/auth/guards", () => ({
  requireSession: mocks.requireSession,
  requireCustomer: mocks.requireCustomer,
}));

vi.mock("@/lib/db", () => ({
  db: mocks.db,
}));

describe("GET /api/conversations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.db.message.count.mockResolvedValue(0);
    mocks.db.order.count.mockResolvedValue(0);
    mocks.db.review.findMany.mockResolvedValue([]);
    mocks.db.provider.findUnique.mockResolvedValue({
      baseCity: "Ankara",
      baseDistrict: "Çankaya",
    });
  });

  it("usta için müşteri e-posta ve telefon bilgisini döndürmez", async () => {
    mocks.requireSession.mockResolvedValue({
      user: {
        id: "provider-user-1",
        role: "PROVIDER",
        provider: { id: "provider-1" },
      },
      error: null,
    });
    mocks.db.conversation.findMany.mockResolvedValue([
      {
        id: "conversation-1",
        providerId: "provider-1",
        customer: {
          id: "customer-1",
          fullName: "Müşteri Adı",
          email: "customer@example.com",
          phone: "05320000000",
          avatarUrl: null,
        },
        provider: {
          user: {
            id: "provider-user-1",
            fullName: "Usta Adı",
            email: "provider@example.com",
            phone: "05440000000",
            avatarUrl: null,
          },
        },
        listing: {
          id: "listing-1",
          title: "Klima Bakımı",
          description: "Detay",
          price: 1000,
          city: "Ankara",
          district: "Çankaya",
          createdAt: new Date("2026-01-01T10:00:00.000Z"),
        },
        privateOffers: [],
        messages: [],
        lastMessageAt: null,
      },
    ]);

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();
    const conversation = body.conversations[0];

    expect(response.status).toBe(200);
    expect(conversation.otherName).toBe("Müşteri Adı");
    expect(conversation.otherAvatarUrl).toBeNull();
    expect(conversation).not.toHaveProperty("otherEmail");
    expect(conversation).not.toHaveProperty("otherPhone");
  });

  it("müşteri için usta e-posta ve telefon bilgisini döndürmez", async () => {
    mocks.requireSession.mockResolvedValue({
      user: { id: "customer-1", role: "CUSTOMER", provider: null },
      error: null,
    });
    mocks.db.conversation.findMany.mockResolvedValue([
      {
        id: "conversation-1",
        providerId: "provider-1",
        customer: {
          id: "customer-1",
          fullName: "Müşteri Adı",
          email: "customer@example.com",
          phone: "05320000000",
          avatarUrl: null,
        },
        provider: {
          user: {
            id: "provider-user-1",
            fullName: "Usta Adı",
            email: "provider@example.com",
            phone: "05440000000",
            avatarUrl: "/avatar.png",
          },
        },
        listing: null,
        privateOffers: [],
        messages: [],
        lastMessageAt: null,
      },
    ]);

    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();
    const conversation = body.conversations[0];

    expect(response.status).toBe(200);
    expect(conversation.otherName).toBe("Usta Adı");
    expect(conversation.otherAvatarUrl).toBe("/avatar.png");
    expect(conversation).not.toHaveProperty("otherEmail");
    expect(conversation).not.toHaveProperty("otherPhone");
  });
});
