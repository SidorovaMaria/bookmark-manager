// components/ui/ThemeToggle.tsx
"use client";
/**
 * ThemeToggle — a two-option segmented control for Light/Dark themes.
 *
 * Accessibility:
 * - Renders as a button group with `role="group"`.
 * - Each button uses `aria-pressed={true|false}` to indicate selection.
 * - Fully keyboard accessible (Tab to focus, Space/Enter to activate).
 *
 * Next.js + next-themes:
 * - Uses `resolvedTheme` + a "mounted" guard to avoid hydration mismatches.
 * - Calls `setTheme("light" | "dark")` directly.
 *
 * Styling:
 * - A sliding "pill" indicates the active theme.
 * - Theme-aware colors (light/dark).
 *
 * Example:
 * ```tsx
 * <ThemeToggle  />
 * ```
 */
import React from "react";
import Image from "next/image";
import clsx from "clsx";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  // Avoid SSR/CSR mismatch: only render the "active" state after mount
  React.useEffect(() => setMounted(true), []);
  // While not mounted, render a neutral shell to prevent hydration mismatch
  const active = mounted ? resolvedTheme : undefined;
  const isLight = active === "light";
  const isDark = active === "dark";
  return (
    <div
      role="group"
      aria-label={" Toggle between Light and Dark themes"}
      className={clsx(
        "relative inline-flex items-center rounded-sm bg-n-300 dark:bg-n-500 p-0.5",
        "transition-colors"
      )}
    >
      {/* Active background "pill" */}
      <span
        aria-hidden
        className={clsx(
          "absolute top-0.5 left-0.5 h-[26px] w-[30px] rounded-sm bg-white dark:bg-n-600",
          "transition-transform duration-300",
          // Slide to the right when dark is active
          isDark && "translate-x-full"
        )}
      />
      {/* Light theme button */}
      <button
        aria-pressed={isLight}
        aria-label="Use light theme"
        className="flex-center w-[30px] h-[26px] relative z-20"
        onClick={() => setTheme("light")}
      >
        <Image
          src="./images/icon-light-theme.svg"
          alt="Light Theme Icon"
          width={14}
          height={14}
          className="dark:invert-100 transition-colors"
          priority
        />
      </button>
      {/* Dark theme button */}
      <button
        aria-pressed={isDark}
        aria-label="Use dark theme"
        className="flex-center w-[30px] h-[26px] relative z-20"
        onClick={() => setTheme("dark")}
      >
        <Image
          src="./images/icon-dark-theme.svg"
          alt="Dark Theme Icon"
          width={14}
          height={14}
          className="dark:invert transition-colors"
          priority
        />
      </button>
    </div>
  );
};

export default ThemeToggle;
