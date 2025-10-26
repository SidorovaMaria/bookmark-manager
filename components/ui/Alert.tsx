// components/ui/Alert.tsx
"use client";
/**
 * Alert — a small, opinionated wrapper around Radix AlertDialog
 * that supports controlled/uncontrolled usage, a pending/locking state,
 * and a “danger” tone for destructive actions.
 *
 * Key ideas:
 * - Works controlled (via `open` + `onOpenChange`) or uncontrolled (internal state).
 * - `handleConfirm` may be sync or async; while it's running we set `pending`.
 * - When `lockWhilePending` is true (default), closing is blocked until it finishes.
 *
 * Accessibility:
 * - Uses Radix `AlertDialog` primitives, which implement focus trapping,
 *   aria roles, Escape handling, screen reader semantics, etc and keyboard navigation.
 */
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState, ReactNode, useCallback, useRef } from "react";
import clsx from "clsx";
import Button from "./Button";
import { X } from "lucide-react";

export type AlertProps = {
  /** The trigger element (e.g. a Button). Will be rendered asChild inside <AlertDialog.Trigger>. */
  children: ReactNode;
  /** Controlled open state. Omit to use the component in uncontrolled mode. */
  open?: boolean;
  /** Controlled open state updater. Required if `open` is provided. */
  onOpenChange?: (open: boolean) => void;
  /** Dialog title (required for accessibility). */
  title: string;
  /** Optional supportive text under the title. */
  description?: string;
  /** Confirm button label (defaults to "Confirm"). */
  confirmLabel?: string;
  /** Cancel button label (defaults to "Cancel"). */
  cancelLabel?: string;
  /** Visual style for the confirm button. */
  tone?: "default" | "danger";
  /**
   * Called when the user confirms. May return void or a Promise.
   * If it returns a Promise, the dialog will show a pending state until it resolves/rejects.
   */
  handleConfirm: () => Promise<void> | void;

  /**
   * Prevent closing while confirm is pending (overlay click, Escape, cancel, trigger re-click).
   * Defaults to true because half-done destructive actions are chaos gremlins.
   */
  lockWhilePending?: boolean;
};

export default function Alert(props: AlertProps) {
  const {
    children,
    open: controlledOpen,
    onOpenChange,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    handleConfirm,
    tone = "default",
    lockWhilePending = true,
  } = props;
  // Uncontrolled open state if `open` prop is not provided.
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  // Pending state guards interactions while awaiting `handleConfirm`.
  const [pending, setPending] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  // Close helper that respects `lockWhilePending`
  const setOpen = useCallback(
    (next: boolean) => {
      if (lockWhilePending && pending) return; // block closing while busy
      if (isControlled) {
        onOpenChange?.(next);
      } else {
        setUncontrolledOpen(next);
      }
    },
    [isControlled, onOpenChange, pending, lockWhilePending]
  );
  const onConfirm = useCallback(async () => {
    try {
      setPending(true);
      await Promise.resolve(handleConfirm?.());
      setPending(false);
      setOpen(false);
    } catch (err) {
      console.log("Alert handleConfirm error:", err);
      // Leaving the dialog open so the user can see error UI that might trigger externally.
      // ! toast or surface an inline error here if you needed
      setPending(false);
    }
  }, [handleConfirm, setOpen]);
  // While pending (and locked), stop Escape and outside-click from closing.
  const blockWhilePending = lockWhilePending && pending;
  // Optional: focus the confirm button on open for fast keyboard confirm.
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay
          //Keep mounted to make sure animation works
          forceMount
          data-pending={pending ? "" : undefined}
          className={clsx(
            "fixed inset-0 bg-[#131313]/50 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
          )}
          // Guard outside click while pending if locked
          onClick={(e) => {
            if (blockWhilePending) e.preventDefault();
          }}
        />
        <AlertDialog.Content
          forceMount
          data-pending={pending ? "" : undefined}
          className={clsx(
            "fixed position-center w-[450px] bg-n-0 dark:bg-n-800 p-6 gap-6 rounded-xl dark:border dark:border-n-500 flex flex-col  data-[state=open]:animate-pop-in-fade data-[state=closed]:animate-pop-out-fade motion-reduce:animate-none"
          )}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            confirmRef.current?.focus();
          }}
          // Guard Escape while pending if locked
          onEscapeKeyDown={(e) => {
            if (blockWhilePending) e.preventDefault();
          }}
        >
          {/* Header  */}
          <div className="flex flex-col w-full gap-2">
            <AlertDialog.Title className="text-1">{title}</AlertDialog.Title>
            {description && (
              <AlertDialog.Description className="text-4-medium text-subtle">
                {description}
              </AlertDialog.Description>
            )}
          </div>
          {/* Top-right dismiss (also locked during pending) */}
          <AlertDialog.Cancel
            className={clsx(
              "size-5 text-subtle absolute top-4 right-4 transition-transform hover:scale-105 disabled:opacity-50"
            )}
            asChild
          >
            <button type="button" disabled={blockWhilePending} aria-label="Close dialog">
              <X />
            </button>
          </AlertDialog.Cancel>

          {/* Actions */}
          <div className="flex justify-end gap-4 w-full text-3">
            <AlertDialog.Cancel asChild>
              <Button type="button" disabled={pending} size="md" tier="secondary">
                {cancelLabel}
              </Button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <Button
                type="button"
                ref={confirmRef}
                size="md"
                tier="primary"
                aria-busy={pending || undefined}
                data-pending={pending ? "" : undefined}
                disabled={pending} // disable repeat clicks while busy
                onClick={onConfirm}
                {...(tone === "danger" ? { error: true } : {})}
              >
                {pending ? "Working..." : confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
