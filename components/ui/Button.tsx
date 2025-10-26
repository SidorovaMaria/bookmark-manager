//components/ui/Button.tsx
"use client";
/**
 * Button — a flexible, accessible button component with tiered visual styles,
 * optional icons, and built-in support for error/danger states.
 *
 * Design principles:
 * - Keeps markup minimal while maintaining predictable styling.
 * - Provides “tier” to visually distinguish primary vs secondary actions.
 * - Supports icons on either side of text.
 * - Integrates cleanly with Tailwind utility classes and custom themes.
 *
 * Example:
 * ```tsx
 * <Button tier="primary" size="md" icon={<Save />} iconPosition="left">
 *   Save Changes
 * </Button>
 * ```
 */
import React from "react";
import clsx from "clsx";

export type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "className"
> & {
  // Visual styles of the button
  tier: "primary" | "secondary";
  /** Size preset (defaults to `md`). Controls padding. */
  size?: "sm" | "md";
  /**
   * Optional visual "error" state.
   * Typically used for destructive or danger actions (e.g., "Delete").
   * Applies red tones to primary tier buttons.
   */
  error?: boolean;
  /** Optional icon component (Lucide icon, SVG, etc.). */
  icon?: React.ReactNode;
  /**
   * Controls whether the icon appears before or after text.
   * Default: `"left"`.
   */
  iconPosition?: "left" | "right";
  /** The visible content (text, children, etc.). */
  children?: React.ReactNode;
  /** Optional custom class name for minor style adjustments. */
  className?: string;
  /** Optional ref to the underlying <button> element. */
  ref?: React.Ref<HTMLButtonElement>;
};
const Button = ({
  tier,
  size = "md",
  error = false,
  icon,
  iconPosition = "left",
  children,
  className,
  ref,
  ...props
}: ButtonProps) => {
  return (
    <button
      ref={ref ?? null}
      {...props}
      // Adds a data attribute for styling error states via CSS selectors
      data-error={error}
      className={clsx(
        `flex-center rounded-lg gap-1 text-3 transition-none  duration-300 focus:focused-ring`,
        // Padding logic — adjusts spacing depending on size and whether there’s text
        children ? (size === "sm" ? "px-3 py-2.5 " : "px-4 py-3") : "p-[5px]",
        // Tier logic: determines color and hover states
        tier === "primary"
          ? " bg-teal-700  text-white hover:bg-teal-800 data-[error=true]:bg-red-800 btn-xs-inset"
          : "bg-n-0 dark:bg-n-800 dark:hover:bg-n-600 hover:bg-n-400 border border-n-400",
        // Allow caller to override/extend styling
        className
      )}
    >
      {/* Left icon */}
      {icon && iconPosition === "left" && <span className="flex-center size-5">{icon}</span>}
      {/* Text label or children */}
      {children}
      {/* Right icon */}
      {icon && iconPosition === "right" && <span className="flex-center size-5">{icon}</span>}
    </button>
  );
};

export default Button;
