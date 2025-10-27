import { comparePassword, generateSalt, hashPassword } from "@/auth/hash";
import { describe, it, expect } from "vitest";

describe("hash utilities", () => {
  it("deterministic for same password+salt", async () => {
    const salt = "somesalt";
    const h1 = await hashPassword("Secret123!", salt);
    const h2 = await hashPassword("Secret123!", salt);
    expect(h1).toBe(h2);
  });

  it("comparePassword true/false", async () => {
    const salt = generateSalt();
    const h = await hashPassword("Secret123!", salt);
    expect(await comparePassword("Secret123!", salt, h)).toBe(true);
    expect(await comparePassword("nope", salt, h)).toBe(false);
  });
  it("generateSalt produces unique salts", () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });
});
