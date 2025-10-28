import data from "./data.json";

//A replacer for the data that will be stored and taken from backend (API/DB)
const jsonData = JSON.parse(JSON.stringify(data)) as { bookmarks: BookmarkType[] };
export const { bookmarks } = jsonData;
