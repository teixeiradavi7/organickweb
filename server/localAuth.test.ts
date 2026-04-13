import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";

// ─── Mock bcryptjs ────────────────────────────────────────────────────────────
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (pw: string) => `hashed:${pw}`),
    compare: vi.fn(async (pw: string, hash: string) => hash === `hashed:${pw}`),
  },
}));

// ─── Mock jose SignJWT ────────────────────────────────────────────────────────
vi.mock("jose", () => ({
  SignJWT: vi.fn().mockImplementation(() => ({
    setProtectedHeader: vi.fn().mockReturnThis(),
    setIssuedAt: vi.fn().mockReturnThis(),
    setExpirationTime: vi.fn().mockReturnThis(),
    sign: vi.fn().mockResolvedValue("mock-jwt-token"),
  })),
}));

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
const mockCredential = {
  id: 1,
  userId: 42,
  email: "test@example.com",
  passwordHash: "hashed:password123",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 42,
  openId: "local:test@example.com",
  name: "Test User",
  email: "test@example.com",
  loginMethod: "local",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

vi.mock("./db", () => ({
  getLocalCredentialByEmail: vi.fn(),
  createLocalUser: vi.fn(),
  getUserById: vi.fn(),
}));

import * as db from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Context factory ──────────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("localAuth.register", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a new user and returns success", async () => {
    vi.mocked(db.getLocalCredentialByEmail).mockResolvedValue(undefined);
    vi.mocked(db.createLocalUser).mockResolvedValue({
      userId: 42,
      email: "test@example.com",
    });
    vi.mocked(db.getUserById).mockResolvedValue(mockUser);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.localAuth.register({
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });

    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("test@example.com");
    expect(db.createLocalUser).toHaveBeenCalledWith(
      "test@example.com",
      "hashed:password123",
      "Test User"
    );
  });

  it("throws CONFLICT when email already exists", async () => {
    vi.mocked(db.getLocalCredentialByEmail).mockResolvedValue(mockCredential);

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.localAuth.register({
        email: "test@example.com",
        password: "password123",
      })
    ).rejects.toThrow(TRPCError);
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.localAuth.register({
        email: "test@example.com",
        password: "short",
      })
    ).rejects.toThrow();
  });
});

describe("localAuth.login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("logs in with correct credentials", async () => {
    vi.mocked(db.getLocalCredentialByEmail).mockResolvedValue(mockCredential);
    vi.mocked(db.getUserById).mockResolvedValue(mockUser);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.localAuth.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.success).toBe(true);
    expect(result.user?.id).toBe(42);
  });

  it("throws UNAUTHORIZED for unknown email", async () => {
    vi.mocked(db.getLocalCredentialByEmail).mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.localAuth.login({ email: "nobody@example.com", password: "pass" })
    ).rejects.toThrow(TRPCError);
  });

  it("throws UNAUTHORIZED for wrong password", async () => {
    vi.mocked(db.getLocalCredentialByEmail).mockResolvedValue(mockCredential);
    vi.mocked(db.getUserById).mockResolvedValue(mockUser);

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.localAuth.login({ email: "test@example.com", password: "wrongpassword" })
    ).rejects.toThrow(TRPCError);
  });
});
