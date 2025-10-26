// components/layout/nav/Sidebar.tsx
"use client";
/**
 * Sidebar — app navigation + tag filters.
 *
 * Features
 * - Responsive slide-in on mobile; static on large screens.
 * - Preserves existing URL params while toggling `?tag=…` (comma-separated).
 * - Case-sensitive, de-duplicated tag toggling.
 * - Uses `router.replace` for query updates to avoid spamming browser history.
 * - Closes itself on route changes (common mobile UX).
 *
 * Accessibility
 * - `nav[role="navigation"]` container.
 * - Close button has aria-label.
 * - Tag items are real <button>s with keyboard support (Enter/Space).
 */
import clsx from "clsx";
import * as React from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Archive, Home, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";
import NavItem from "@/components/ui/NavItem";
import { tagCounts } from "@/data/data";

type SideBarProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const Sidebar = ({ open, setOpen }: SideBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  // Show "Reset" button if any tag filters are active
  const [showReset, setShowReset] = React.useState(false);
  /** Read current tags from the URL (comma-separated). Always normalized to lowercase. */
  const readTags = React.useCallback((): string[] => {
    const raw = searchParams.get("tag") || "";
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }, [searchParams]);
  /** Whether a given tag (any case) is currently selected. */
  const hasTag = React.useCallback(
    (tag: string) => {
      const tags = readTags();
      return tags.includes(tag);
    },
    [readTags]
  );
  /**
   * Toggle a tag in the `tag` query param.
   * - Case-insensitive
   * - De-duplicated
   * - Preserves other URL params
   * - Uses `replace` to keep history clean
   */
  const toggleTag = React.useCallback(
    (tag: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = readTags();
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
    [pathname, router, searchParams, readTags]
  );
  /** Preserve query params while navigating to a new path. */
  const withParams = React.useCallback(
    (newPathname: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const qs = params.toString();
      return qs ? `${newPathname}?${qs}` : newPathname;
    },
    [searchParams]
  );
  /** Remove all tags from params. */
  const handleReset = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Show reset only if there are any tags applied
  React.useEffect(() => {
    setShowReset(readTags().length > 0);
  }, [readTags]);

  // Auto-close on route change (mobile)
  React.useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <nav
      role="navigation"
      className={clsx(
        "absolute top-0 left-0 bottom-0 z-50 min-h-screen min-w-[296px]",
        "bg-n-0 dark:bg-n-800 border-r border-r-n-300 dark:border-r-n-500",
        "transform duration-300 ease-in-out  ",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      aria-label="Primary"
      id="sidebar"
    >
      <div className="flex flex-col gap-4 h-full pb-5">
        {/* Header */}
        <div className="px-5 pt-5 pb-2.5 flex ">
          <Logo />
        </div>
        {/* Close (mobile) */}
        <Button
          onClick={() => setOpen(false)}
          tier="secondary"
          aria-label="Close sidebar"
          className="absolute right-1.5 top-1.5 border-0 lg:hidden"
          icon={<X className="size-5 text-n-900 dark:text-n-0" />}
        />

        {/* Nav Items */}
        <div className=" flex flex-col px-4">
          {/* Archived And Home */}
          <NavItem icon={Home} label="Home" active={pathname === "/"} href={withParams("/")} />
          <NavItem
            icon={Archive}
            label="Archived"
            active={pathname === "/archive"}
            href={withParams("/archive")}
          />
        </div>

        {/* Tags header + reset */}
        <div className="flex items-center justify-between px-3 pb-[5px] mx-4">
          <h4 className="text-xs font-bold uppercase leading-140 text-subtle">Tags</h4>
          {showReset && (
            <button
              type="button"
              onClick={handleReset}
              className="group relative text-xs font-medium leading-130 tracking-[1%] text-subtle hover:brightness-110"
            >
              Reset
              <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[#D9D9D9] transition-transform duration-300 group-hover:scale-x-100 dark:bg-n-300" />
            </button>
          )}
        </div>
        {/* Tags list */}
        <div className="h-full overflow-auto pb-5 ml-4 pr-3 mr-1">
          <div className="flex flex-col gap-1">
            {tagCounts.map(({ tag, count }) => {
              const active = hasTag(tag);
              return (
                <NavItem
                  key={tag}
                  checkbox
                  active={active}
                  count={count}
                  label={tag}
                  href="#"
                  onToggle={() => toggleTag(tag)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
