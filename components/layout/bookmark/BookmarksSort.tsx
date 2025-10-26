// components/layout/bookmark/BookmarksSort.tsx
"use client";
import { sortActions } from "@/constants/actions";
import clsx from "clsx";
import { DropdownMenu } from "radix-ui";

import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { dropdownStyleWrapper } from "./BookmarkDropdown";

/**
 * BookmarksSort component that renders a dropdown menu for sorting bookmarks.
 *
 * This component reads the current sort parameter from the URL search params and
 * displays sorting options in a dropdown menu. When a user selects a sort option,
 * it updates the URL with the new sort parameter.
 *
 * @component
 * @returns {JSX.Element} A fragment containing dropdown menu items for sorting options
 *
 * @example
 * ```tsx
 * <BookmarksSort />
 * ```
 *
 * @remarks
 * - Uses Next.js router for navigation and URL parameter management
 * - Displays a check icon next to the currently selected sort option
 * - Relies on external `sortActions` array for available sorting options
 * - Each sort action must have `TYPE`, `slug`, and `title` properties
 */
const BookmarksSort = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentSort = searchParams.get("sort") || "rec-added";
  const handleSortChange = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", type);
    router.replace(`/?${params.toString()}`);
  };

  return (
    <>
      {sortActions.map((action) => (
        <DropdownMenu.Item
          autoFocus={false}
          key={action.TYPE}
          className={clsx(dropdownStyleWrapper)}
          onSelect={() => handleSortChange(action.slug)}
        >
          {action.title}
          {action.slug === currentSort && (
            <Check className="size-4 ml-auto text-primary" aria-hidden />
          )}
        </DropdownMenu.Item>
      ))}
    </>
  );
};

export default BookmarksSort;
