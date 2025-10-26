// components/ui/Toast.tsx
"use client";

/**
 * A tiny wrapper around Sonner's `toast.custom` that renders a fully custom,
 * accessible toast with optional description, action, and intent-based styling.
 *
 * Usage:
 *  toast({
 *    title: "Saved",
 *    icon: "check" | "copy" | "pin" | "store" | "restore" | "trash"; //used in *    design
 *  });
 *
 */
import clsx from "clsx";
import { Archive, Check, Copy, Pin, RotateCcw, Trash, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { toast as sonnerToast } from "sonner";

// Available toast icons
export type ToastIconName = "check" | "copy" | "pin" | "store" | "restore" | "trash";

// Mapping of icon names to Lucide icon components
const TOAST_ICONS: Record<ToastIconName, LucideIcon> = {
  check: Check,
  copy: Copy,
  pin: Pin,
  store: Archive,
  restore: RotateCcw,
  trash: Trash,
};

interface ToastOptions {
  /** The main title text of the toast. */
  title: string;
  /** The icon name to display (from TOAST_ICONS). */
  icon: ToastIconName;
  /** Duration in milliseconds before auto-dismissal (default per Sonner config). */
  duration?: number;
  dismissible?: boolean;
}
interface InnerToastProps extends ToastOptions {
  id: string | number;
}

export function toast(opts: ToastOptions) {
  const { duration = 1000 } = opts;
  return sonnerToast.custom(
    (id) => <InnerToast id={id} {...opts} />,
    // Sonner options (not DOM props)
    { duration }
  );
}

/** A fully custom toast that still maintains the animations and interactions. */
function InnerToast(props: InnerToastProps) {
  const { title, icon, id, dismissible = true } = props;
  const Icon = TOAST_ICONS[icon];
  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        "min-w-[320px] max-w-[440px]",
        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
        "bg-n-0  dark:bg-n-500 ",
        "border border-n-300 dark:border-n-400 shadow-[0px_6px_9px] shadow-[rgba(12,12,12,0,12)]"
      )}
    >
      {/* ICON */}
      <Icon className="h-4 w-4 shrink-0 " />
      {/* Text block */}
      <p className="text-4-medium w-full">{title}</p>
      {/* Dismiss */}
      {dismissible && (
        <button
          type="button"
          onClick={() => sonnerToast.dismiss(id)}
          aria-label="Dismiss alert"
          className="p-1 rounded-sm focus:focused-ring"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
