import data from "./data.json";

//A replacer for the data that will be stored and taken from backend (API/DB)
const jsonData = JSON.parse(JSON.stringify(data)) as { bookmarks: BookmarkType[] };
const { bookmarks } = jsonData;
type TagCount = {
  tag: string;
  count: number;
};
const getTagCounts = (bookmarks: BookmarkType[]): TagCount[] => {
  const tagMap: { [key: string]: number } = {};
  bookmarks.forEach((bookmark) => {
    bookmark.tags.forEach((tag) => {
      if (tagMap[tag]) {
        tagMap[tag]++;
      } else {
        tagMap[tag] = 1;
      }
    });
  });
  return Object.entries(tagMap).map(([tag, count]) => ({ tag, count }));
};

export const tagCounts = getTagCounts(bookmarks).sort((a, b) => a.tag.localeCompare(b.tag));
const user = {
  name: "John Doe",
  avatar: "/images/image-avatar.webp",
  email: "emily101@gmail.com",
};
const bookmarkExample = bookmarks[2];

export { bookmarkExample };
export { jsonData, bookmarks, user };
