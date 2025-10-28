"use server";

import { getCurrentUser } from "@/auth/actions";
import { bookMarkOutput, bookMarkSaveOutput, bookMarkSaveSchema } from "../validation/bookmark";
import { connectDb } from "../mongodb";
import { Bookmark, IBookmark } from "@/models/Bookmark";
import { revalidatePath } from "next/cache";
import { Tag } from "@/context/provider";
import { getFaviconUrl } from "../getFavicon";
import { bookmarks } from "@/constants/data/data";
function revalidate(isArchived: boolean) {
  if (isArchived) {
    revalidatePath("/archived");
  } else {
    revalidatePath("/");
  }
}
// CREATE A BOOKMARK ACTION
export async function createBookmark({
  bookmark,
}: {
  bookmark: bookMarkOutput;
}): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  const bookmarkData: bookMarkSaveOutput = { ...bookmark, userId: String(userId.user) };
  const { success, data } = bookMarkSaveSchema.safeParse(bookmarkData);
  if (!success) {
    return { ok: false, error: "Invalid bookmark data." };
  }
  const faviconUrl = getFaviconUrl(data.url);

  const { title, description, url, tags, userId: uId } = data;
  try {
    await connectDb();
    const bookmark = await Bookmark.create({
      userId: uId,
      title,
      description,
      url,
      tags,
      favicon: faviconUrl,
    });
    if (!bookmark) {
      return { ok: false, error: "Failed to create bookmark." };
    }
    revalidate(false);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to create bookmark." };
  }
}

export async function editBookmark({
  bookmarkId,
  bookmark,
}: {
  bookmarkId: string;
  bookmark: Partial<bookMarkOutput>;
}): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  try {
    const dbBookmark = await Bookmark.findOne({ _id: bookmarkId, userId: String(userId.user) });
    if (!dbBookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    if (bookmark.title !== undefined) dbBookmark.title = bookmark.title;
    if (bookmark.description !== undefined) dbBookmark.description = bookmark.description;
    if (bookmark.url !== undefined) {
      dbBookmark.url = bookmark.url;
      const faviconUrl = getFaviconUrl(bookmark.url);
      dbBookmark.favicon = faviconUrl;
    }

    if (bookmark.tags !== undefined) dbBookmark.tags = bookmark.tags;
    await dbBookmark.save();
    revalidate(false);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to edit bookmark." };
  }
}

export async function getAllUserTags(): Promise<
  { ok: true; tags: Tag[] } | { ok: false; error: string }
> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  try {
    await connectDb();
    const allTags = await Bookmark.find({ userId: String(userId.user) }).select("tags -_id");
    const tagCounts = allTags
      .flatMap((doc) => doc.tags) // flatten all tags arrays
      .reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1; // count occurrences
        return acc;
      }, {} as Record<string, number>);

    const tags = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name)) as Tag[];

    return { ok: true, tags };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to fetch user tags." };
  }
}

export async function getUserBookmarks({
  searchParams,
}: {
  searchParams: Partial<bookmarkSearchParams>;
}): Promise<{ ok: true; bookmarks: IBookmark[] } | { ok: false; error: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  try {
    await connectDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId: String(userId.user) };
    if (searchParams.archived !== undefined) {
      query.isArchived = searchParams.archived;
    }
    if (searchParams.withTags && searchParams.withTags.length > 0) {
      query.tags = { $all: searchParams.withTags };
    }
    if (searchParams.query) {
      query.$or = [
        { title: { $regex: searchParams.query, $options: "i" } },
        { description: { $regex: searchParams.query, $options: "i" } },
      ];
    }
    let sortOption: { [key: string]: -1 | 1 } = { pinned: -1, createdAt: -1 }; // default sort
    if (searchParams.sortby === "rec-visited") {
      sortOption = { pinned: -1, lastVisitedAt: -1 };
    } else if (searchParams.sortby === "most-visited") {
      sortOption = { pinned: -1, visitCount: -1 };
    }
    const page = searchParams.page && searchParams.page > 0 ? searchParams.page : 1;
    const limit = searchParams.limit && searchParams.limit > 0 ? searchParams.limit : 20;
    const bookmarks = await Bookmark.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    return {
      ok: true,
      bookmarks: JSON.parse(JSON.stringify(bookmarks)),
    };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to fetch bookmarks." };
  }
}

export async function deleteBookmark({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  const userId = await getCurrentUser();
  if (!userId) {
    return { ok: false, error: "User not authenticated." };
  }
  try {
    const result = await Bookmark.deleteOne({ _id: bookmarkId, userId: String(userId.user) });
    if (result.deletedCount === 0) {
      return { ok: false, error: "Bookmark not found." };
    }
    revalidate(true);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to delete bookmark." };
  }
}

export async function incrementBookmarkVisitCount({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    bookmark.visitCount += 1;
    bookmark.lastVisitedAt = new Date();
    await bookmark.save();
    revalidate(bookmark.isArchived);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to increment visit count." };
  }
}
export async function pinBookmark({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    bookmark.pinned = true;
    await bookmark.save();
    revalidate(bookmark.isArchived);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to pin bookmark." };
  }
}

export async function unpinBookmark({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    bookmark.pinned = false;
    await bookmark.save();
    revalidate(bookmark.isArchived);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to unpin bookmark." };
  }
}

export async function archiveBookmark({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    bookmark.isArchived = true;
    await bookmark.save();
    revalidate(false);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to archive bookmark." };
  }
}

export async function unarchiveBookmark({
  bookmarkId,
}: {
  bookmarkId: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const bookmark = await Bookmark.findById(bookmarkId);
    if (!bookmark) {
      return { ok: false, error: "Bookmark not found." };
    }
    bookmark.isArchived = false;
    await bookmark.save();
    revalidate(true);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to unarchive bookmark." };
  }
}

export async function populateDemoBookmarks(
  userId: string,
  pathname: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await connectDb();
    const demoBookMarks = bookmarks.map((bm) => ({
      ...bm,
      userId: userId,
      demo: true,
    }));
    await Bookmark.insertMany(demoBookMarks);
    revalidate(pathname.includes("/archived") ? true : false);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to populate demo bookmarks." };
  }
}
export async function removeDemoBookmarks(
  userId: string,
  pathname: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    await connectDb();
    await Bookmark.deleteMany({ userId: userId, demo: true });
    revalidate(pathname.includes("/archived") ? true : false);
    return { ok: true };
  } catch (error) {
    console.error(error);
    return { ok: false, error: "Failed to remove demo bookmarks." };
  }
}
export async function havePopulatedDemoBookmarks(
  userId: string
): Promise<{ ok: boolean; populated: boolean; error?: string }> {
  try {
    await connectDb();
    const count = await Bookmark.countDocuments({ userId: userId, demo: true });
    return { ok: true, populated: count > 0 };
  } catch (error) {
    console.error(error);
    return { ok: false, populated: false, error: "Failed to check demo bookmarks." };
  }
}
