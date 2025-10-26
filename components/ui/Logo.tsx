// components/ui/Logo.tsx
"use client";

/**
 * Logo — a responsive, theme-aware logo component for your app.
 *
 * Features:
 * - Switches automatically between light/dark logo images using Tailwind’s `dark:` selector.
 * - Provides semantic accessibility (`role="link"` + optional `onClick` / `href`).
 * - Accepts optional sizing overrides and alt text.
 * - Uses Next.js <Image> for optimization and lazy loading.
 *
 * Example:
 * ```tsx
 * <Logo onClick={() => router.push("/")} />
 * ```
 */

import Image from "next/image";
import React from "react";
import clsx from "clsx";

export type LogoProps = {
  /** Optional alt text (defaults to 'Bookmark Manager'). */
  alt?: string;
  /** Optional width (default 214). */
  width?: number;
  /** Optional height (default 32). */
  height?: number;
  /** Adds pointer & click handling (e.g. navigate home). */
  onClick?: () => void;
  /** Optional extra class names for the wrapper. */
  className?: string;
  /** If provided, wraps the logo in an anchor instead of a div. */
  href?: string;
};

export default function Logo({
  alt = "Bookmark Manager",
  width = 214,
  height = 32,
  onClick,
  className,
  href,
}: LogoProps) {
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      role={href || onClick ? "link" : undefined}
      href={href}
      onClick={onClick}
      tabIndex={href || onClick ? 0 : undefined}
      className={clsx("inline-block cursor-pointer select-none", className)}
    >
      {/* Light Theme Logo */}
      <Image
        src="/images/logo-light-theme.svg"
        width={width}
        height={height}
        alt={alt}
        className="block dark:hidden"
        priority
      />

      {/* Dark Theme Logo */}
      <Image
        src="/images/logo-dark-theme.svg"
        width={width}
        height={height}
        alt={alt}
        className="hidden dark:block"
        priority
      />
    </Wrapper>
  );
}
