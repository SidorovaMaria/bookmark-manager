import DataRenderer from "@/components/DataRenderer";
import BookMarkCard from "@/components/layout/bookmark/BookmarkCard";
import {
  EMPTY_ARCHIVED_BOOKMARKS,
  EMPTY_SEARCH_RESULTS,
  ERROR_ARCHIVED_BOOKMARKS,
} from "@/constants";
import { getUserBookmarks } from "@/lib/actions/bookmark.action";
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tag, search, sort } = await searchParams;
  const result = await getUserBookmarks({
    searchParams: {
      query: typeof search === "string" ? search : "",
      withTags: typeof tag === "string" ? [tag] : Array.isArray(tag) ? tag : [],
      page: 1,
      limit: 50,
      sortby: (sort as sortByType) || "rec-added",
      archived: true,
    },
  });

  const ok = result.ok;
  const bookmarks = result.ok ? result.bookmarks : [];

  return (
    <DataRenderer
      success={ok}
      error={ERROR_ARCHIVED_BOOKMARKS}
      data={bookmarks}
      empty={tag || search ? EMPTY_SEARCH_RESULTS : EMPTY_ARCHIVED_BOOKMARKS}
      render={(bookmarks) => (
        <section className="grid grid-cols1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 overflow-auto">
          {bookmarks.map((item) => (
            <BookMarkCard key={String(item._id)} bookmark={item} />
          ))}
        </section>
      )}
    />
  );
}
