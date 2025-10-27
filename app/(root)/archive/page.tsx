import BookMarkCard from "@/components/layout/bookmark/BookmarkCard";
import { bookmarks } from "@/constants/data/data";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { tag, search } = await searchParams;
  const bookmarksToShow = bookmarks.filter((bookmark) => {
    let matches = true;
    if (tag) {
      const tags = Array.isArray(tag) ? tag : tag.split(",");
      matches = tags.every((t) => bookmark.tags.includes(t));
    }
    if (search) {
      const searchTerm = Array.isArray(search) ? search[0] : search;
      matches =
        matches &&
        (bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    matches = matches && bookmark.isArchived;
    return matches;
  });

  if (bookmarksToShow.length > 0) {
    return (
      <section className="grid grid-cols1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8 overflow-auto">
        {bookmarksToShow.map((bookmark) => (
          <BookMarkCard key={bookmark.id} bookmark={bookmark} />
        ))}
      </section>
    );
  }

  return (
    <>
      <h2 className="text-lg font-semibold">No bookmarks found</h2>
    </>
  );
}
