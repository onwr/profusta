import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireSession: vi.fn(),
  getConversationForUser: vi.fn(),
  getOtherPartyName: vi.fn(),
}));

vi.mock("@/lib/auth/guards", () => ({
  requireSession: mocks.requireSession,
}));

vi.mock("@/lib/conversations/access", () => ({
  getConversationForUser: mocks.getConversationForUser,
  getOtherPartyName: mocks.getOtherPartyName,
}));

describe("GET /api/conversations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireSession.mockResolvedValue({
      user: { id: "provider-user-1", role: "PROVIDER", provider: { id: "provider-1" } },
      error: null,
    });
    mocks.getOtherPartyName.mockReturnValue("Müşteri Adı");
  });

  it("konuşma detayında e-posta ve telefon bilgisini döndürmez", async () => {
    mocks.getConversationForUser.mockResolvedValue({
      isCustomer: false,
      conversation: {
        id: "conversation-1",
        listing: {
          id: "listing-1",
          title: "Klima Bakımı",
          description: "Detay",
          price: 1000,
          city: "Ankara",
          district: "Çankaya",
          createdAt: new Date("2026-01-01T10:00:00.000Z"),
        },
        customer: {
          fullName: "Müşteri Adı",
          avatarUrl: null,
          email: "customer@example.com",
          phone: "05320000000",
        },
        provider: {
          user: {
            fullName: "Usta Adı",
            avatarUrl: "/provider.png",
            email: "provider@example.com",
            phone: "05440000000",
          },
        },
        privateOffers: [],
      },
    });

    const { GET } = await import("./route");
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "conversation-1" }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.conversation.otherName).toBe("Müşteri Adı");
    expect(body.conversation.otherAvatarUrl).toBeNull();
    expect(body.conversation).not.toHaveProperty("otherEmail");
    expect(body.conversation).not.toHaveProperty("otherPhone");
  });
});
