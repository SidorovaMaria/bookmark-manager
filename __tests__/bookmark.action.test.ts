import { afterAll, beforeAll, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { connectTestDb, clearDb, disconnectTestDb } from "@/__tests__/setupTestDB";
import { Bookmark } from "@/models/Bookmark";

import * as bookmarkActions from "@/lib/actions/bookmark.action";
import { getCurrentUser } from "@/auth/actions";

// --- Mocks ---
const userId = "64a7b2f4f1c2e3d4b5a6c7d8";
vi.mock("@/lib/mongodb", () => ({ connectDb: vi.fn(async () => true) }));

// Mock the current user to be authenticated by default
vi.mock("@/auth/actions", () => ({
  getCurrentUser: vi.fn(async () => ({ user: userId })),
}));
const revalidatePathSpy = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathSpy(path),
}));
// Deterministic favicon helper
vi.mock("@/lib/getFavicon", () => ({
  getFaviconUrl: (url: string) => `https://icon.horse/icon/${new URL(url).hostname}`,
}));

// Tiny demo data set for populate/remove demo actions
vi.mock("@/constants/data/data", () => ({
  bookmarks: [
    { title: "Demo A", url: "https://a.dev", description: "A", tags: ["a"] },
    { title: "Demo B", url: "https://b.dev", description: "B", tags: ["b"] },
  ],
}));

// Helper: quick factory
const bookmarkFactory = (
  overrides: Partial<{
    title: string;
    url: string;
    description: string;
    tags: string[];
    isArchived: boolean;
    pinned: boolean;
    visitCount?: number;
  }> = {}
) => ({
  title: "Sample",
  url: "https://example.com",
  description: "Desc",
  tags: ["alpha", "beta"],
  ...overrides,
});
describe("bookmark server actions", () => {
  beforeAll(async () => {
    await connectTestDb();
    await Bookmark.init();
  });

  beforeEach(async () => {
    await clearDb();
    revalidatePathSpy.mockClear();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });
  it("createBookmark: creates with favicon, revalidates '/' ", async () => {
    const res = await bookmarkActions.createBookmark({ bookmark: bookmarkFactory() });
    expect(res).toEqual({ ok: true });

    const saved = await Bookmark.findOne({ userId });
    expect(saved).toBeTruthy();
    expect(saved?.favicon).toBe("https://icon.horse/icon/example.com");
    expect(revalidatePathSpy).toHaveBeenCalledWith("/");
  });
  it("createBookmark: rejects when unauthenticated", async () => {
    (getCurrentUser as unknown as Mock).mockResolvedValueOnce(null);
    const res = await bookmarkActions.createBookmark({ bookmark: bookmarkFactory() });
    expect(res).toEqual({ ok: false, error: "User not authenticated." });
  });
  it("createBookmark: rejects invalid data by schema", async () => {
    const res = await bookmarkActions.createBookmark({
      // empty title invalid for your Zod schema
      bookmark: bookmarkFactory({ title: "" }),
    });
    expect(res).toEqual({ ok: false, error: "Invalid bookmark data." });
  });
  it("editBookmark: updates fields and refreshes favicon on url change", async () => {
    const doc = await Bookmark.create({ ...bookmarkFactory(), userId });
    const res = await bookmarkActions.editBookmark({
      bookmarkId: String(doc._id),
      bookmark: { title: "New", url: "https://news.ycombinator.com", description: "Changed" },
    });
    expect(res).toEqual({ ok: true });

    const upd = await Bookmark.findById(doc._id);
    expect(upd?.title).toBe("New");
    expect(upd?.description).toBe("Changed");
    expect(upd?.url).toBe("https://news.ycombinator.com");
    expect(upd?.favicon).toBe("https://icon.horse/icon/news.ycombinator.com");
    // editBookmark -> revalidate(false) -> "/"
    expect(revalidatePathSpy).toHaveBeenCalledWith("/");
  });
  it("editBookmark: returns error when not found / not owned", async () => {
    const res = await bookmarkActions.editBookmark({
      bookmarkId: "653c3c9a9a9a9a9a9a9a9a9a",
      bookmark: { title: "X" },
    });
    expect(res).toEqual({ ok: false, error: "Bookmark not found." });
  });
  it("getAllUserTags: returns counts sorted by tag name", async () => {
    await Bookmark.insertMany([
      { ...bookmarkFactory({ tags: ["a", "b"] }), userId },
      { ...bookmarkFactory({ tags: ["b", "c"] }), userId },
      { ...bookmarkFactory({ tags: ["a"] }), userId },
    ]);
    const res = await bookmarkActions.getAllUserTags();
    if (res.ok) {
      expect(res.tags).toEqual([
        { name: "a", count: 2 },
        { name: "b", count: 2 },
        { name: "c", count: 1 },
      ]);
    } else {
      throw new Error("Expected ok");
    }
  });
  it("getUserBookmarks: filters by archive flag, tags, query and sorts by defaults", async () => {
    await Bookmark.insertMany([
      {
        ...bookmarkFactory({
          title: "Read Later",
          tags: ["news"],
          isArchived: false,
          pinned: true,
        }),
        userId,
      },
      { ...bookmarkFactory({ title: "Alpha Tool", tags: ["tools"], isArchived: false }), userId },
      {
        ...bookmarkFactory({ title: "Zeta Article", tags: ["news", "react"], isArchived: true }),
        userId,
      },
    ]);

    const res = await bookmarkActions.getUserBookmarks({
      searchParams: {
        archived: false,
        withTags: ["news"],
        query: "read", // case-insensitive regex in title/description
        sortby: undefined,
        page: 1,
        limit: 10,
      },
    });

    if (res.ok) {
      expect(res.bookmarks.length).toBe(1);
      expect(res.bookmarks[0].title).toBe("Read Later");
      // default sort: pinned desc, createdAt desc
    } else {
      throw new Error("Expected ok");
    }
  });
  it("getUserBookmarks: sorts by most-visited and paginates", async () => {
    const bulk = [];
    for (let i = 0; i < 6; i++) {
      bulk.push({
        ...bookmarkFactory({ title: `B${i}`, visitCount: i }),
        userId,
      });
    }
    await Bookmark.insertMany(bulk);

    const res = await bookmarkActions.getUserBookmarks({
      searchParams: { sortby: "most-visited", page: 2, limit: 2 },
    });

    if (res.ok) {
      // visitCount order desc => B5, B4, B3, B2, B1, B0
      // page 2, limit 2 => items 3-4 => B3, B2
      expect(res.bookmarks.map((b) => b.title)).toEqual(["B3", "B2"]);
    } else {
      throw new Error("Expected ok");
    }
  });
  it("deleteBookmark: deletes only user’s bookmark and revalidates '/archived' when isArchived", async () => {
    const active = await Bookmark.create({ ...bookmarkFactory(), userId, isArchived: false });
    const archived = await Bookmark.create({ ...bookmarkFactory(), userId, isArchived: true });

    // delete archived one
    const res1 = await bookmarkActions.deleteBookmark({ bookmarkId: String(archived._id) });
    expect(res1).toEqual({ ok: true });
    expect(await Bookmark.findById(archived._id)).toBeNull();
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");

    // delete active one
    revalidatePathSpy.mockClear();
    const res2 = await bookmarkActions.deleteBookmark({ bookmarkId: String(active._id) });
    expect(res2).toEqual({ ok: true });
    expect(await Bookmark.findById(active._id)).toBeNull();
    // deleteBookmark() uses revalidate(true) in your code path (since you pass true) -> "/archived"
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");
  });
  it("deleteBookmark: returns error when not found", async () => {
    const res = await bookmarkActions.deleteBookmark({ bookmarkId: "653c3c9a9a9a9a9a9a9a9a9a" });
    expect(res).toEqual({ ok: false, error: "Bookmark not found." });
  });
  it("incrementBookmarkVisitCount: bumps count and sets lastVisitedAt", async () => {
    const doc = await Bookmark.create({
      ...bookmarkFactory(),
      userId,
      isArchived: false,
      visitCount: 0,
    });
    const res = await bookmarkActions.incrementBookmarkVisitCount({ bookmarkId: String(doc._id) });
    expect(res).toEqual({ ok: true });

    const updated = await Bookmark.findById(doc._id);
    expect(updated?.visitCount).toBe(1);
    expect(updated?.lastVisitedAt).toBeInstanceOf(Date);
    // non-archived -> revalidate("/")
    expect(revalidatePathSpy).toHaveBeenCalledWith("/");
  });
  it("pinBookmark & unpinBookmark: toggles and revalidates", async () => {
    const doc = await Bookmark.create({ ...bookmarkFactory(), userId, isArchived: true });
    const r1 = await bookmarkActions.pinBookmark({ bookmarkId: String(doc._id) });
    expect(r1).toEqual({ ok: true });
    expect((await Bookmark.findById(doc._id))?.pinned).toBe(true);
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");

    revalidatePathSpy.mockClear();
    const r2 = await bookmarkActions.unpinBookmark({ bookmarkId: String(doc._id) });
    expect(r2).toEqual({ ok: true });
    expect((await Bookmark.findById(doc._id))?.pinned).toBe(false);
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");
  });
  it("archiveBookmark & unarchiveBookmark: flags and revalidates correct page", async () => {
    const doc = await Bookmark.create({ ...bookmarkFactory(), userId, isArchived: false });

    const r1 = await bookmarkActions.archiveBookmark({ bookmarkId: String(doc._id) });
    expect(r1).toEqual({ ok: true });
    expect((await Bookmark.findById(doc._id))?.isArchived).toBe(true);
    // action calls revalidate(false) -> "/"
    expect(revalidatePathSpy).toHaveBeenCalledWith("/");

    revalidatePathSpy.mockClear();
    const r2 = await bookmarkActions.unarchiveBookmark({ bookmarkId: String(doc._id) });
    expect(r2).toEqual({ ok: true });
    expect((await Bookmark.findById(doc._id))?.isArchived).toBe(false);
    // action calls revalidate(true) -> "/archived"
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");
  });
  it("populateDemoBookmarks: inserts demo=true and revalidates depending on pathname", async () => {
    const r1 = await bookmarkActions.populateDemoBookmarks(userId, "/");
    expect(r1).toEqual({ ok: true });
    const count = await Bookmark.countDocuments({ userId, demo: true });
    expect(count).toBe(2);
    expect(revalidatePathSpy).toHaveBeenCalledWith("/");

    revalidatePathSpy.mockClear();
    const r2 = await bookmarkActions.populateDemoBookmarks(userId, "/archived");
    expect(r2).toEqual({ ok: true });
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");
  });
  it("havePopulatedDemoBookmarks & removeDemoBookmarks: roundtrip", async () => {
    // initially false
    let chk = await bookmarkActions.havePopulatedDemoBookmarks(userId);
    expect(chk).toEqual({ ok: true, populated: false });

    await bookmarkActions.populateDemoBookmarks(userId, "/");
    chk = await bookmarkActions.havePopulatedDemoBookmarks(userId);
    expect(chk).toEqual({ ok: true, populated: true });

    revalidatePathSpy.mockClear();
    const rm = await bookmarkActions.removeDemoBookmarks(userId, "/archived/whatever");
    expect(rm).toEqual({ ok: true });
    expect(revalidatePathSpy).toHaveBeenCalledWith("/archived");

    chk = await bookmarkActions.havePopulatedDemoBookmarks(userId);
    expect(chk).toEqual({ ok: true, populated: false });
  });
});
