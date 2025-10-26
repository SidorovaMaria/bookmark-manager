import { Archive, Copy, ExternalLink, Pin, RotateCcw, SquarePen, Trash } from "lucide-react";

export const DropdDownAction: Record<string, DropDownActionType> = {
  visit: {
    TYPE: "VISIT",
    title: "Visit",
    icon: ExternalLink,
  },
  copy: {
    TYPE: "COPY",
    title: "Copy URL",
    icon: Copy,
  },
  pin: {
    TYPE: "PIN",
    title: "Pin",
    icon: Pin,
  },
  unpin: {
    TYPE: "UNPIN",
    title: "Unpin",
    icon: Pin,
  },
  edit: {
    TYPE: "EDIT",
    title: "Edit",
    icon: SquarePen,
  },
  archive: {
    TYPE: "ARCHIVE",
    title: "Archive",
    icon: Archive,
  },
  unarchive: {
    TYPE: "UNARCHIVE",
    title: "Unarchive",
    icon: RotateCcw,
  },
  delete: {
    TYPE: "DELETE",
    title: "Delete",
    icon: Trash,
  },
};
const defaultAction = [
  "visit",
  "copy",
  "pin",
  "edit",
  "archive",
] as (keyof typeof DropdDownAction)[];
const pinnedAction = [
  "visit",
  "copy",
  "unpin",
  "edit",
  "archive",
] as (keyof typeof DropdDownAction)[];
const archivedAction = ["visit", "copy", "unarchive", "delete"] as (keyof typeof DropdDownAction)[];
export const actionMap = {
  default: defaultAction,
  pinned: pinnedAction,
  archived: archivedAction,
};

export const sortActions = [
  {
    TYPE: "RECENTLY_ADDED",
    title: "Recently Added",
    slug: "rec-added",
  },
  {
    TYPE: "RECENTLY_VISITED",
    title: "Recently Visited",
    slug: "rec-visited",
  },
  {
    TYPE: "MOST_VISITED",
    title: "Most Visited",
    slug: "most-visited",
  },
] as const;
