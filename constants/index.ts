import { Frown, SearchX } from "lucide-react";

export const EMPTY_BOOKMARKS = {
  title: "No bookmarks found",
  message: "You haven't added any bookmarks yet. Start adding to see them here.",
  icon: Frown,
};

export const EMPTY_SEARCH_RESULTS = {
  title: "No bookmarks match your search",
  message: "Try adjusting your search or filters to find what you're looking for.",
  icon: SearchX,
};

export const ERROR_BOOKMARKS = {
  title: "Unable to load bookmarks",
  message: "Please try again later.",
  icon: Frown,
};

export const EMPTY_ARCHIVED_BOOKMARKS = {
  title: "No archived bookmarks",
  message: "You haven't archived any bookmarks yet.",
  icon: Frown,
};

export const ERROR_ARCHIVED_BOOKMARKS = {
  title: "Unable to load archived bookmarks",
  message: "Please try again later.",
  icon: Frown,
};

export const DEFAULT_ERROR = {
  title: "Something went wrong",
  message: "Please try again later.",
  icon: Frown,
};
export const isInput = (element: HTMLElement | null) => {
  if (!element) return false;
  const tagName = element.tagName;
  return (
    tagName === "INPUT" || tagName === "TEXTAREA" || (element as HTMLElement).isContentEditable
  );
};
