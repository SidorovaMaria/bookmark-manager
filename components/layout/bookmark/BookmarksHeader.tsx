//components/layout/bookmark/BookmarksHeader.tsx
"use client";
/**
 * BookmarksHeader — page header for the bookmarks list.
 *
 * Shows:
 * - Title (based on current route)
 * - Sort dropdown trigger
 * - Active search summary
 * - Active tag chips (click to remove)
 *
 * URL sync:
 * - Reads `?search=` and `?tag=` (comma-separated).
 * - Toggles tags case-sensitively and preserves other params.
 * - Uses `router.replace` to avoid cluttering history during quick filters.
 *
 * Accessibility:
 * - Sort trigger has an accessible label.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { ArrowDownUp, X } from "lucide-react";
import DropDown from "@/components/ui/DropDown";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import BookmarksSort from "./BookmarksSort";

const BookmarksHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tags, search] = useMemo(() => {
    return [searchParams.get("tag")?.split(",") || [], searchParams.get("search") || ""];
  }, [searchParams]);
  const title = useMemo(() => {
    switch (pathname) {
      case "/":
        return "All bookmarks";
      case "/archive":
        return "Archived bookmarks";
      default:
        return "Bookmarks";
    }
  }, [pathname]);

  const toggleTag = React.useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const raw = searchParams.get("tag") || "";
      const current = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const t = tag;

      let next: string[];
      if (current.includes(t)) {
        next = current.filter((x) => x !== t);
      } else {
        next = Array.from(new Set([...current, t]));
      }

      if (next.length === 0) params.delete("tag");
      else params.set("tag", next.join(","));
      router.replace(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  return (
    <aside
      aria-label="Bookmarks Sort and Search Results"
      role="navigation"
      className="flex flex-col w-full gap-2"
    >
      <div className="flex w-full gap-4 items-center">
        <h2 id="bookmarks-header" className="text-2 md:text-1 flex-1">
          {title}
        </h2>
        <DropDown dropDownContent={<BookmarksSort />}>
          <Button
            tier="secondary"
            size="sm"
            iconPosition="left"
            icon={<ArrowDownUp className="size-5 " />}
          >
            <p className="text-3">Sort By</p>
          </Button>
        </DropDown>
      </div>
      {(search || tags.length > 0) && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between ">
          {search && (
            <div className="text-n-600 dark:text-n-400 text-4 ">
              Showing results for <strong>&quot;{search}&quot;</strong>
            </div>
          )}
          {tags && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Tag
                  key={tag}
                  tag={tag}
                  className="not-dark:bg-n-0! capitalize"
                  icon={<X className="size-5 " />}
                  onClick={() => toggleTag(tag)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default BookmarksHeader;
