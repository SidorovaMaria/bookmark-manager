//components/ui/Tag.tsx
"use client";

/**
 * Tag — a small, rounded label for categories, tags, or statuses.
 *
 * Features:
 * - Theme-aware colors (light/dark).
 * - Semantic accessibility (renders as a <span> by default).
 * - Supports optional icon or click/delete behavior.
 * - Easy to restyle via `className`.
 *
 * Example:
 * ```tsx
 * <Tag tag="Design" />
 * <Tag tag="React" icon={<Code />} />
 * <Tag tag="Urgent" onClick={() => filterBy("Urgent")} />
 * ```
 */

import React from "react";
import clsx from "clsx";

export type TagProps = {
  /** The visible text label of the tag. */
  tag: string;
  /** Optional icon to render before the text. */
  icon?: React.ReactNode;
  /** Called when the tag is clicked (useful for filters). */
  onClick?: () => void;
  /** Optional extra class names for styling or color tweaks. */
  className?: string;
  /** ARIA label override, e.g., for icons-only tags. */
  ariaLabel?: string;
};

const Tag = ({ tag, icon, onClick, ariaLabel, className }: TagProps) => {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      aria-label={ariaLabel || (onClick ? `Filter by ${tag}` : undefined)}
      className={clsx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-4 transition-colors ",
        "bg-n-100 text-n-800 dark:bg-n-600 dark:text-n-100",
        onClick && "cursor-pointer hover:brightness-150",
        className
      )}
    >
      {icon && <span className="flex-center size-4">{icon}</span>}
      <span>{tag}</span>
    </Component>
  );
};

export default Tag;
