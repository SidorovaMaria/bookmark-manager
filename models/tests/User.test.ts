import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { User } from "../User";
import { clearDb, connectTestDb, disconnectTestDb } from "@/__tests__/setupTestDB";

const userFactory = (
  overrides?: Partial<{ name: string; email: string; passwordHash: string }>
) => ({
  name: "John Doe",
  email: "johndoe@example.com",
  passwordHash: "hashedpassword123",
  ...overrides,
});

describe("User model", () => {
  beforeAll(async () => {
    await connectTestDb();
    // Ensure indexes are created (unique email) before tests run
    await User.init();
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("creates a valid user with defaults", async () => {
    const user = await User.create(userFactory());
    expect(user._id).toBeDefined();
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("johndoe@example.com");
    expect(user.signInCount).toBe(0); // default
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  describe("required fields", () => {
    const cases = [
      { label: "missing name", data: { email: "x@x.com", passwordHash: "h" } },
      { label: "missing email", data: { name: "X", passwordHash: "h" } },
      { label: "missing passwordHash", data: { name: "X", email: "x@x.com" } },
    ];

    it.each(cases)("rejects $label", async ({ data }) => {
      //Since we're testing for rejections, we need to tell Vitest to expect one assertion here - strict.
      expect.assertions(1);
      await expect(
        User.create(data as Partial<{ name: string; email: string; passwordHash: string }>)
      ).rejects.toMatchObject({
        name: "ValidationError",
      });
    });
  });
  it("lowercases email on save", async () => {
    const user = await User.create(userFactory({ email: "ALLCAPS@EXAMPLE.COM" }));
    expect(user.email).toBe("allcaps@example.com");
    const found = await User.findOne({ email: "allcaps@example.com" });
    expect(found?.email).toBe("allcaps@example.com");
  });
  it("enforces unique email (duplicate key)", async () => {
    await User.create(userFactory({ email: "dup@example.com" }));
    expect.assertions(1);
    await expect(
      User.create(userFactory({ name: "Another", email: "dup@example.com" }))
    ).rejects.toMatchObject({ code: 11000 }); // Mongo duplicate index error
  });

  it("trims name and email", async () => {
    const user = await User.create(
      userFactory({ name: "  Spacey Name  ", email: "  spaced@example.com  " })
    );
    expect(user.name).toBe("Spacey Name");
    expect(user.email).toBe("spaced@example.com");
  });
});
