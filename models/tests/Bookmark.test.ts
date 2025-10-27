import { clearDb, connectTestDb, disconnectTestDb } from "@/__tests__/setupTestDB";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Bookmark } from "../Bookmark";

const bookmarkFactory = (
  overrides?: Partial<{ title: string; url: string; description: string; tags: string[] }>
) => ({
  title: "Sample Bookmark",
  url: "https://example.com",
  description: "This is a sample bookmark.",
  tags: ["sample", "bookmark"],
  ...overrides,
});

describe("Bookmark model", () => {
  beforeAll(async () => {
    await connectTestDb();
    // Ensure indexes are created (unique email) before tests run
    await Bookmark.init();
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });
  it("creates a valid bookmark with defaults", async () => {
    const bookmark = await Bookmark.create(bookmarkFactory());
    expect(bookmark._id).toBeDefined();
    expect(bookmark.title).toBe("Sample Bookmark");
    expect(bookmark.url).toBe("https://example.com");
    expect(bookmark.description).toBe("This is a sample bookmark.");
    expect(bookmark.tags).toEqual(["sample", "bookmark"]);
    expect(bookmark.pinned).toBe(false); // default
    expect(bookmark.isArchived).toBe(false); // default
    expect(bookmark.visitCount).toBe(0); // default
    expect(bookmark.lastVisitedAt).toBeNull(); // since the visit count is 0 we set it to null -> meaning never visited
    expect(bookmark.createdAt).toBeInstanceOf(Date);
    expect(bookmark.updatedAt).toBeInstanceOf(Date);
  });
  describe("required fields", () => {
    const cases = [
      { label: "missing title", data: { url: "https://x.com", description: "d", tags: ["tag"] } },
      { label: "missing url", data: { title: "X", description: "d", tags: ["tag"] } },
      { label: "missing description", data: { title: "X", url: "https://x.com", tags: ["tag"] } },
    ];

    it.each(cases)("rejects $label", async ({ data }) => {
      expect.assertions(1);
      await expect(
        Bookmark.create(data as Partial<{ name: string; email: string; passwordHash: string }>)
      ).rejects.toMatchObject({
        name: "ValidationError",
      });
    });
  });
  it("rejects empty tags array", async () => {
    await expect(
      Bookmark.create(
        bookmarkFactory({
          tags: [],
        })
      )
    ).rejects.toMatchObject({
      name: "ValidationError",
      message: expect.stringContaining("At least one tag is required."),
    });
  });
  it("trims string fields", async () => {
    const bookmark = await Bookmark.create(
      bookmarkFactory({
        title: "   Trimmed Title   ",
        url: "   https://trimmed.com   ",
        description: "   Trimmed description.   ",
      })
    );
    expect(bookmark.title).toBe("Trimmed Title");
    expect(bookmark.url).toBe("https://trimmed.com");
    expect(bookmark.description).toBe("Trimmed description.");
  });
  it("allows setting optional fields", async () => {
    const bookmark = await Bookmark.create(
      bookmarkFactory({
        title: "Optional Fields",
        url: "https://optional.com",
        description: "Testing optional fields.",
        tags: ["optional"],
      })
    );
    bookmark.favicon = "https://optional.com/favicon.ico";
    bookmark.pinned = true;
    bookmark.isArchived = true;
    bookmark.visitCount = 5;
    bookmark.lastVisitedAt = new Date();
    await bookmark.save();
    const fetchedBookmark = await Bookmark.findById(bookmark._id);
    expect(fetchedBookmark?.favicon).toBe("https://optional.com/favicon.ico");
    expect(fetchedBookmark?.pinned).toBe(true);
    expect(fetchedBookmark?.isArchived).toBe(true);
    expect(fetchedBookmark?.visitCount).toBe(5);
    expect(fetchedBookmark?.lastVisitedAt).toBeInstanceOf(Date);
  });
});
