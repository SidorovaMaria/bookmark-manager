// components/layout/bookmark/BookmarkDropdown.tsx
"use client";

import { toast } from "@/components/ui/Toast";
import { actionMap, DropdDownAction } from "@/constants/actions";
import {
  archiveBookmark,
  deleteBookmark,
  incrementBookmarkVisitCount,
  pinBookmark,
  unarchiveBookmark,
  unpinBookmark,
} from "@/lib/actions/bookmark.action";
import { IBookmark } from "@/models/Bookmark";
/**
 * CardDropDown — Radix Dropdown items for a Bookmark card.
 *
 * Responsibilities:
 * - Resolve which actions to show based on pinned/archived state (via `actionMap`).
 * - Perform local side-effects (visit, copy, simple toasts).
 * - Expose extensibility hooks:
 *    - `onAction(type, bookmark)`: parent can respond/track.
 *    - `keepOpenFor`: keep menu open for rapid multi-actions (e.g., repeated COPY).
 *
 * Notes:
 * - Uses secure window opening (noopener/noreferrer).
 * - Clipboard copy implements a robust fallback when `navigator.clipboard` is unavailable.
 */

import { DropdownMenu } from "radix-ui";

import { useMemo } from "react";
export const dropdownStyleWrapper =
  "flex items-center w-full justify-start gap-2.5 p-2 rounded-md text-4 hover:bg-n-100 dark:hover:bg-n-500 cursor-pointer transition-all duration-300 focus-visible:focused-ring dark:focus:ring-offset-n-800 dark:focus:ring-n-100 focus:outline-none";

type CardDropDownProps = {
  bookmark: IBookmark;
  isArchived: boolean;
  isPinned: boolean;
  /** Open parent edit UI, if provided. */
  setEdit?: (edit: boolean) => void;
};
const BookmarkDropdown = ({ bookmark, isArchived, isPinned, setEdit }: CardDropDownProps) => {
  const source = isArchived ? actionMap.archived : isPinned ? actionMap.pinned : actionMap.default;
  const actions = useMemo(() => source.map((key) => DropdDownAction[key]), [source]);

  const visit = async () => {
    const win = window.open(bookmark.url, "_blank", "noopener,noreferrer");
    if (win) win.opener = null;
    const result = await incrementBookmarkVisitCount({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to record visit.", icon: "trash" });
    }
  };
  const copyUrl = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(bookmark.url);
      } else {
        // Fallback for older browsers/private mode
        const textarea = document.createElement("textarea");
        textarea.value = bookmark.url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      toast({ title: "Link copied to clipboard.", icon: "copy" });
    } catch {
      toast({ title: "Could not copy the link.", icon: "trash" });
    }
  };
  const pin = async () => {
    const result = await pinBookmark({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to pin the bookmark.", icon: "trash" });
      return;
    }
    toast({ title: "Bookmark pinned to top.", icon: "pin" });
  };
  const unpin = async () => {
    const result = await unpinBookmark({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to unpin the bookmark.", icon: "trash" });
      return;
    }
    toast({ title: "Bookmark unpinned.", icon: "pin" });
  };

  const archive = async () => {
    const result = await archiveBookmark({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to archive the bookmark.", icon: "trash" });
      return;
    }
    toast({ title: "Bookmark archived.", icon: "store" });
  };
  const unarchive = async () => {
    const result = await unarchiveBookmark({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to restore the bookmark.", icon: "trash" });
      return;
    }
    toast({ title: "Bookmark restored.", icon: "restore" });
  };

  const edit = () => {
    setEdit?.(true);
  };
  const del = async () => {
    const result = await deleteBookmark({ bookmarkId: String(bookmark._id) });
    if (!result.ok) {
      toast({ title: "Failed to delete the bookmark.", icon: "trash" });
      return;
    }
    toast({ title: "Bookmark deleted.", icon: "trash" });
  };

  // Central dispatcher: ensures exhaustive handling
  const handle = (type: ActionType) => {
    switch (type) {
      case "VISIT":
        visit();
        return;
      case "COPY":
        void copyUrl();
        return;
      case "PIN":
        pin();
        return;
      case "UNPIN":
        unpin();
        return;
      case "ARCHIVE":
        archive();
        return;
      case "UNARCHIVE":
        unarchive();
        return;
      case "EDIT":
        edit();
        return;
      case "DELETE":
        del();
        return;
      default: {
        // Exhaustiveness guard for future types:
        const _never: never = type;
        return _never;
      }
    }
  };

  return (
    <>
      {actions.map((action) => {
        const Icon = action.icon;
        const type = action.TYPE as ActionType;
        return (
          <DropdownMenu.Item
            key={action.title}
            autoFocus={false}
            aria-label={action.title}
            className={dropdownStyleWrapper}
            onSelect={() => {
              handle(type);
            }}
          >
            <Icon
              data-icon={action.title.toLowerCase()}
              className="size-4 text-subtle data-[icon='unpin']:rotate-45"
              aria-hidden
            />
            {action.title}
          </DropdownMenu.Item>
        );
      })}
    </>
  );
};

export default BookmarkDropdown;
