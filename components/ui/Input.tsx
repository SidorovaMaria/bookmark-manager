// components/ui/Input.tsx
"use client";
import clsx from "clsx";
/**
 * Input — a minimal, accessible text input with label, error, hint, and optional icon.
 *
 * Features
 * - Associates <label>↔<input> via `id`
 * - Announces errors with `aria-invalid` + `aria-describedby`
 * - Shows a required asterisk and sets `aria-required`
 * - Optional hint (hidden when error is shown)
 * - Optional leading icon
 * - ClassName slots for light theming without forking
 *
 * Example:
 * <Input id="email" type="email" label="Email" required error={errors.email?.message} />
 */
import React from "react";
import { baseWrapperClass } from "./InputForm";
import type { LucideIcon } from "lucide-react";

export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "className"> & {
  /** Unique id to link label↔input and (optionally) error text. */
  id: string;
  /** Visible label text. */
  label?: string;
  /** Adds asterisk and sets `aria-required`. Validation remains in your form layer. */
  required?: boolean;
  /** Error message (if present, input is marked invalid and message is announced). */
  error?: string;
  // Optional leading icon
  icon?: LucideIcon;
  /** Additional class names for the outer wrapper. */
  className?: string;
  /** Optional helper text shown when no error is present. */
  hint?: string;
};
const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, required, error, hint, icon, className, ...props },
  ref
) {
  const hasError = Boolean(error);
  const describedBy = hasError ? `${id}-error` : undefined;
  const Icon = icon;
  return (
    <div className="flex flex-col gap-1.5 w-full ">
      {/* LABEL */}
      {label && (
        <label htmlFor={id} className="text-4 text-n-900 dark:text-n-0">
          {label}
          {required && (
            <span className="ml-0.5 text-teal-700 dark:text-n-100" aria-hidden>
              *
            </span>
          )}
        </label>
      )}
      {/* CONTROL WRAPPER */}
      <div
        data-error={hasError || undefined}
        className={clsx(baseWrapperClass, hasError && "border-red-800!", className)}
      >
        {icon && Icon && <Icon className="size-5 text-subtle" aria-hidden />}
        <input
          id={id}
          ref={ref}
          aria-required={required || undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          className="w-full bg-transparent outline-none"
          {...props}
        />
      </div>
      {/* ERROR / HINT */}
      {hasError ? (
        <p id={`${id}-error`} className="text-4 text-red-800">
          {error}
        </p>
      ) : (
        hint && <p className="text-4-medium text-subtle">{hint}</p>
      )}
    </div>
  );
});

export default Input;
