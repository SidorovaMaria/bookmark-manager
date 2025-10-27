import { describe, expect, it, vi } from "vitest";
import { redisMock } from "../mocks/redisClient";
import { createUserSession, getUserFromSession, removeUserFromSession } from "@/auth/session";
// Point the session module at our mocked redis client
vi.mock("@/lib/redis/redis", () => import("../mocks/redisClient"));
// Minimal cookie jar for testing
function makeCookies() {
  const jar = new Map<string, string>();
  return {
    api: {
      set: (k: string, v: string) => jar.set(k, v),
      get: (k: string) => (jar.has(k) ? { name: k, value: jar.get(k)! } : undefined),
      delete: (k: string) => jar.delete(k),
    },
    jar,
  };
}
describe("auth/session", () => {
  it("createUserSession: sets cookie and redis entry", async () => {
    const { api, jar } = makeCookies();

    await createUserSession("user-123", api);

    const cookie = api.get("session-id");
    expect(cookie?.value).toBeTruthy();

    const redisVal = await redisMock.get(`session:${cookie!.value}`);
    expect(redisVal).toBe("user-123");

    expect(jar.has("session-id")).toBe(true);
  });
  it("getUserFromSession: returns userId when cookie present", async () => {
    const { api } = makeCookies();
    await createUserSession("user-xyz", api);

    const uid = await getUserFromSession({ get: api.get });
    expect(uid).toBe("user-xyz");
  });
  it("getUserFromSession: returns null when no cookie", async () => {
    const { api } = makeCookies();
    const uid = await getUserFromSession({ get: api.get });
    expect(uid).toBeNull();
  });
  it("removeUserFromSession: deletes redis key and clears cookie", async () => {
    const { api } = makeCookies();
    await createUserSession("user-1", api);
    const sid = api.get("session-id")!.value;

    await removeUserFromSession({ get: api.get, delete: api.delete });

    expect(await redisMock.get(`session:${sid}`)).toBeNull();
    expect(api.get("session-id")).toBeUndefined();
  });
  it("removeUserFromSession: no-op if cookie missing", async () => {
    const { api } = makeCookies();
    await expect(
      removeUserFromSession({ get: api.get, delete: api.delete })
    ).resolves.toBeUndefined();
  });
});
