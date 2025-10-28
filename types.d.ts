type BookmarkType = {
  id: string;
  title: string;
  url: string;
  favicon: string;
  description: string;
  tags: string[];
  pinned: boolean;
  isArchived: boolean;
  visitCount: number;
  createdAt: string;
  lastVisited: string;
};
type ActionType = "VISIT" | "COPY" | "PIN" | "UNPIN" | "EDIT" | "ARCHIVE" | "UNARCHIVE" | "DELETE";
type DropDownActionType = {
  TYPE: ActionType;
  title: string;
  icon: LucideIcon;
};

type Cookies = {
  set: (
    key: string,
    value: string,
    options: {
      secure?: boolean;
      httpOnly?: boolean;
      sameSite?: "strict" | "lax";
      expires?: number;
    }
  ) => void;
  get: (key: string) => { name: string; value: string } | undefined;
  delete: (key: string) => void;
};
type sortByType = "rec-added" | "rec-visited" | "most-visited";
type bookmarkSearchParams = {
  query: string;
  page: number;
  limit: number;
  sortby: sortByType;
  withTags: string[];
  archived: boolean;
};
