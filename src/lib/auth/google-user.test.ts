import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/db", () => ({
  db: { user: mocks.user },
}));

import { GoogleAuthError } from "@/lib/auth/google-auth-error";
import { resolveGoogleUser } from "@/lib/auth/google-user";

const profile = {
  sub: "google-sub-1",
  email: "user@example.com",
  emailVerified: true,
  fullName: "Test User",
  picture: "https://example.com/avatar.png",
};

describe("resolveGoogleUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("googleSub ile mevcut kullanıcıyı döndürür", async () => {
    mocks.user.findUnique.mockResolvedValueOnce({
      id: "u1",
      email: "user@example.com",
      role: UserRole.CUSTOMER,
      isActive: true,
      provider: null,
    });

    const user = await resolveGoogleUser(profile, "login");
    expect(user.id).toBe("u1");
    expect(mocks.user.create).not.toHaveBeenCalled();
  });

  it("e-posta eşleşince googleSub bağlar", async () => {
    mocks.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: "u2",
        email: "user@example.com",
        role: UserRole.PROVIDER,
        isActive: true,
        avatarUrl: null,
        provider: { status: "APPROVED" },
      });

    mocks.user.update.mockResolvedValueOnce({
      id: "u2",
      email: "user@example.com",
      role: UserRole.PROVIDER,
      isActive: true,
      googleSub: "google-sub-1",
      provider: { status: "APPROVED" },
    });

    const user = await resolveGoogleUser(profile, "login");
    expect(mocks.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u2" },
        data: expect.objectContaining({ googleSub: "google-sub-1" }),
      }),
    );
    expect(user.id).toBe("u2");
  });

  it("login intent ile bilinmeyen e-posta kayıt gerektirir", async () => {
    mocks.user.findUnique.mockResolvedValue(null);
    mocks.user.findFirst.mockResolvedValue(null);

    await expect(resolveGoogleUser(profile, "login")).rejects.toMatchObject({
      code: "need_register",
    });
  });

  it("register intent ile yeni müşteri oluşturur", async () => {
    mocks.user.findUnique.mockResolvedValue(null);
    mocks.user.findFirst.mockResolvedValue({ id: "referrer-1" });
    mocks.user.create.mockResolvedValueOnce({
      id: "new-1",
      email: "user@example.com",
      role: UserRole.CUSTOMER,
      isActive: true,
      provider: null,
    });

    const user = await resolveGoogleUser(profile, "register", "referrer-1");
    expect(mocks.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: UserRole.CUSTOMER,
          passwordHash: null,
          googleSub: "google-sub-1",
          referredByUserId: "referrer-1",
        }),
      }),
    );
    expect(user.id).toBe("new-1");
  });

  it("askıya alınmış usta reddedilir", async () => {
    mocks.user.findUnique.mockResolvedValueOnce({
      id: "u3",
      email: "user@example.com",
      role: UserRole.PROVIDER,
      isActive: true,
      provider: { status: "SUSPENDED" },
    });

    await expect(resolveGoogleUser(profile, "login")).rejects.toBeInstanceOf(
      GoogleAuthError,
    );
  });
});
