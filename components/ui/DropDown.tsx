// components/ui/DropDown.tsx
"use client";
import { isInput } from "@/constants";
/**
 * DropDown — a thin wrapper around Radix DropdownMenu.
 *
 * Goals:
 * - Use any React element as the trigger (`children`).
 * - Render any custom body via `dropDownContent`, injecting a stable `closeDropdown()` prop.
 * - Support both controlled and uncontrolled open state.
 * - Keep styling flexible with className "slots".
 * - Sensible accessibility & focus behavior out of the box.
 *
 * Example:
 * ```tsx
 * <DropDown
 *   dropDownContent={
 *     <MenuBody /> // receives { closeDropdown }
 *   }
 * >
 *   <Button tier="secondary" icon={<EllipsisVertical />} aria-label="Open menu" />
 * </DropDown>
 * */

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import React, { cloneElement, useCallback, useEffect, useMemo, useState } from "react";

type DropDownBodyProps = {
  /** Provided to your content so it can close the dropdown (e.g., after a chosen action). */
  closeDropdown?: () => void;
};
type DropDownProps = {
  children: React.ReactNode; // Trigger element
  dropDownContent: React.ReactElement<DropDownBodyProps>; // Content inside the dropdown
  openKey?: string; // Optional key to control open state externally
};

const DropDown = ({ children, dropDownContent, openKey }: DropDownProps) => {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!openKey) return;
    window.addEventListener("keydown", (e) => {
      if (e.key === openKey && !isInput) {
        if (!open) {
          e.preventDefault();
          setOpen((prev) => !prev);
        }
      }
    });
    return () => {
      window.removeEventListener("keydown", () => {});
    };
  }, [openKey, open]);

  // Stable function to close the dropdown
  const close = useCallback(() => setOpen(false), [setOpen]);
  // Clone the provided content to inject the closeDropdown props
  const contentWithProps = useMemo(
    () => cloneElement(dropDownContent, { closeDropdown: close }),
    [dropDownContent, close]
  );
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen} modal>
      {/* Trigger */}
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        {/* Dropdown content */}
        <DropdownMenu.Content
          forceMount
          className="bg-n-0 dark:bg-n-600 p-2 flex flex-col gap-1 rounded-md border border-n-100 dark:border-n-500 shadow-[0px_6px_14px] shadow-[rgba(34,38,39,0.1)] data-[state=open]:animate-dropdown-in data-[state=closed]:animate-dropdown-out text-subtle min-w-[200px] z-50  "
          align="end"
          side="bottom"
          sideOffset={8}
          loop
        >
          {contentWithProps}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default DropDown;
