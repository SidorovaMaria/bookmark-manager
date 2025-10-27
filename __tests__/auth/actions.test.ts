import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearDb, connectTestDb, disconnectTestDb } from "../setupTestDB";
import { User } from "@/models/User";
import { getCurrentUser, logOut, signIn, signUp } from "@/auth/actions";
import { redisMock } from "../mocks/redisClient";
const cookieJar = new Map<string, string>();
const cookiesApi = {
  set: (k: string, v: string) => cookieJar.set(k, v),
  get: (k: string) => (cookieJar.has(k) ? { name: k, value: cookieJar.get(k)! } : undefined),
  delete: (k: string) => cookieJar.delete(k),
};
vi.mock("next/headers", () => ({ cookies: () => cookiesApi }));
vi.mock("@/lib/redis/redis", () => import("../mocks/redisClient"));
vi.mock("@/lib/mongodb", () => ({ connectDb: vi.fn(async () => true) }));
vi.mock("next/navigation", async (orig) => {
  const actual = await orig();
  const base = actual as Record<string, unknown>;
  return {
    ...base,
    redirect: (url: string) => {
      const err = new Error(`REDIRECT:${url}`);
      (err as Error & { __isRedirect?: boolean }).__isRedirect = true;
      throw err;
    },
  };
});
describe("auth/actions.ts", () => {
  beforeAll(async () => {
    await connectTestDb();
    await User.init(); // ensure unique indexes exist
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });
  // ================= SIGN-UP TESTS =================
  it("signUp: rejects invalid form data", async () => {
    const res = await signUp({ name: "A", email: "bademail", password: "123" });
    expect(res).toEqual({ error: "Invalid form data." });
  });
  it("signUp: returns error when email already exists", async () => {
    await User.create({
      name: "Existing",
      email: "dup@example.com",
      passwordHash: "h",
      salt: "s",
    });
    const res = await signUp({ name: "New", email: "dup@example.com", password: "Secret123!" });
    expect(res).toEqual({ error: "Email is already registered." });
  });

  it("signUp: creates user, sets session (cookie+redis), returns ok", async () => {
    const res = await signUp({ name: "Maria", email: "maria@example.com", password: "Secret123!" });
    expect(res).toEqual({ ok: true });

    const created = await User.findOne({ email: "maria@example.com" });
    expect(created).toBeTruthy();
    expect(created?.passwordHash).toBeTruthy();
    expect(created?.salt).toBeTruthy();

    // cookie should be set
    const sid = cookiesApi.get("session-id")?.value;
    expect(sid).toBeTruthy();

    // redis should map session->userId
    const redisVal = await redisMock.get(`session:${sid}`);
    expect(redisVal).toEqual(String(created!._id));
  });
  it("signUp: handles internal errors", async () => {
    // simulate DB connection failure
    const { connectDb } = await import("@/lib/mongodb");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectDb as any).mockImplementationOnce(async () => {
      throw new Error("DB down");
    });
    const res = await signUp({ name: "Test", email: "test@example.com", password: "Secret123!" });
    expect(res).toEqual({ error: "Internal server error during sign-up." });
  });
  it("signUp: handles user creation failure", async () => {
    // simulate User.create failure
    const createSpy = vi.spyOn(User, "create").mockImplementationOnce(async () => null!);
    const res = await signUp({ name: "Test", email: "test@example.com", password: "Secret123!" });
    expect(res).toEqual({ error: "Failed to create user." });
    createSpy.mockRestore();
  });

  //   ================= SIGN-IN TESTS =================
  it("signIn: rejects invalid form data", async () => {
    const res = await signIn({ email: "bademail", password: "" });
    expect(res).toEqual({ error: "Invalid form data." });
  });
  it("signIn: returns error for non-existing email", async () => {
    const res = await signIn({ email: "nonexistent@example.com", password: "Secret123!" });
    expect(res).toEqual({ error: "Invalid credentials." });
  });
  it("signIn: returns error for incorrect password", async () => {
    const salt = "testsalt";
    const passwordHash = await (await import("@/auth/hash")).hashPassword("CorrectPassword!", salt);
    await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      salt,
    });
    const res = await signIn({ email: "test@example.com", password: "WrongPassword!" });
    expect(res).toEqual({ error: "Invalid credentials." });
  });
  it("signIn: sets session (cookie+redis) and returns ok on success", async () => {
    const salt = "testsalt";
    const passwordHash = await (await import("@/auth/hash")).hashPassword("CorrectPassword!", salt);
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      salt,
    });
    const res = await signIn({ email: "test@example.com", password: "CorrectPassword!" });
    expect(res).toEqual({ ok: true });

    // cookie should be set
    const sid = cookiesApi.get("session-id")?.value;
    expect(sid).toBeTruthy();

    // redis should map session->userId
    const redisVal = await redisMock.get(`session:${sid}`);
    expect(redisVal).toEqual(String(user!._id));
  });
  it("signIn: handles internal errors", async () => {
    // simulate DB connection failure
    const { connectDb } = await import("@/lib/mongodb");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (connectDb as any).mockImplementationOnce(async () => {
      throw new Error("DB down");
    });
    const res = await signIn({ email: "test@example.com", password: "CorrectPassword!" });
    expect(res).toEqual({ error: "Internal server error during sign-in." });
  });
  // ================= LOGOUT TESTS =================
  it("check cookie exist before logout and clears session on logout", async () => {
    const sid = cookiesApi.get("session-id")?.value;
    expect(sid).toBeTruthy();
    const redisVal = await redisMock.get(`session:${sid}`);
    expect(redisVal).toBeTruthy();
    await logOut();
    const postLogoutCookie = cookiesApi.get("session-id");
    expect(postLogoutCookie).toBeUndefined();
    const postLogoutRedisVal = await redisMock.get(`session:${sid}`);
    expect(postLogoutRedisVal).toBeNull();
  });
  // ================= GET CURRENT USER TESTS =================
  it("getCurrentUser: returns null when no session (redirect=false)", async () => {
    const res = await getCurrentUser({ redirect: false, userdata: false });
    expect(res).toBeNull();
  });
  it("getCurrentUser: returns user data when session valid", async () => {
    const salt = "testsalt";
    const passwordHash = await (await import("@/auth/hash")).hashPassword("CorrectPassword!", salt);
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      salt,
    });
    // Sign in to create session
    await signIn({ email: "test@example.com", password: "CorrectPassword!" });
    const res = await getCurrentUser({ redirect: false, userdata: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const u = (res as any).user;
    expect(String(u._id)).toBe(String(user._id));
    expect(u).toMatchObject({
      name: "Test User",
      email: "test@example.com",
    });
    expect(u.passwordHash).toBeUndefined();
    expect(u.salt).toBeUndefined();
  });
  it("getCurrentUser: redirects when no session and redirect=true", async () => {
    // hard reset to avoid false positives from previous tests
    cookieJar.clear();
    redisMock.reset();
    expect(cookiesApi.get("session-id")).toBeUndefined();

    await expect(getCurrentUser({ redirect: true, userdata: false })).rejects.toMatchObject({
      __isRedirect: true,
      message: "REDIRECT:/sign-in",
    });
  });
});
