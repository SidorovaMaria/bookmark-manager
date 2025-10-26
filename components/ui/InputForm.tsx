// components/ui/InputField.tsx
"use client";
/**
 * InputField — a typed, RHF-aware input/textarea with label, hint, error, icon, and char counter.
 *
 * Works with react-hook-form via `useFormContext`. Renders either:
 * - <input> (default) OR
 * - <textarea> (when `isTextarea: true`)
 *
 * Accessibility:
 * - Associates <label> with control via `htmlFor`/`id`.
 * - Announces errors with `aria-invalid` + `aria-describedby`.
 * - Marks required fields visually and with `aria-required`.
 *
 * Character Counter:
 * - `charLimit` shows "current / limit" and applies `maxLength` to the control.
 *
 */
import clsx from "clsx";
import React, { InputHTMLAttributes } from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
// BASE WRAPPER STYLE
export const baseWrapperClass =
  "p-3 rounded-lg bg-n-0 dark:bg-n-600 border border-n-500 dark:border-n-300 " +
  "text-4-medium flex items-center gap-2 " +
  "placeholder:text-n-800 dark:placeholder:text-n-100 " +
  "hover:bg-n-100 dark:hover:bg-n-500 has-focus:focused-ring " +
  "shadow-[0_1px_2px] shadow-[#0A0D1280] dark:shadow-[#ffffff80]";

type BaseProps<T extends FieldValues> = {
  /** react-hook-form field name (supports nested paths like "address.city"). */
  name: Path<T>;
  /** Visible label text. */

  label: string;
  /** Renders asterisk + sets aria-required. Validation remains in your RHF schema/rules. */
  required?: boolean;
  /** Optional helper text (hidden when there’s an error). */
  hint?: string;
  /** Placeholder for the input/textarea. */
  placeholder?: string;
  /**
   * Character limit. When set, applies `maxLength` and shows a counter.
   * (This is character-based, not word-based.)
   */
  charLimit?: number;
  /** Optional icon element. Lucide icon, SVG, etc. */
  icon?: React.ReactNode;
  /** Whether to show the icon if provided (defaults to true when `icon` exists). */
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "id">;

type InputVariantProps = {
  isTextarea?: false;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "id" | "children" | "className">;

type TextareaVariantProps = {
  isTextarea: true;
  /** Number of rows for textarea (default 4). */
  rows?: number;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "name" | "id" | "children" | "className" | "rows"
>;

export type InputFieldProps<T extends FieldValues> = BaseProps<T> &
  (InputVariantProps | TextareaVariantProps);

const InputForm = <T extends FieldValues>(props: InputFieldProps<T>) => {
  const {
    name,
    label,
    required,
    hint,
    placeholder,
    icon,
    charLimit,
    // Discriminant + variant props spread into controls later
    isTextarea,
    ...rest
  } = props as InputFieldProps<T> & {
    // local refinement for the rest spread
    [key: string]: unknown;
  };
  const {
    register,
    watch,
    formState: { errors, isSubmitting },
  } = useFormContext<T>();
  // Make a stable, valid id from the path (e.g., "user.name" -> "user-name")
  const inputId = name.replace(/\./g, "-");
  const hasError = !!errors[name];
  const errorMessage =
    errors[name]?.message?.toString?.() ?? (required ? "This field is required." : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full ">
      {/* Label */}
      <label htmlFor={inputId} className="text-4  ">
        {label}
        {/* required asterisk */}
        {required && <span className="text-teal-700 dark:text-n-100 ml-0.5">*</span>}
      </label>
      {/* CONTROL WRAPPER */}
      <div
        className={clsx(
          baseWrapperClass,
          hasError && "border-red-800!",
          isTextarea && "items-start"
        )}
        data-error={hasError || undefined}
      >
        {/* ICON */}
        {icon && (
          <span
            className={clsx(
              "flex-center size-5 text-n-800 dark:text-n-100",
              isTextarea && "items-start"
            )}
          >
            {icon}
          </span>
        )}
        {/* INPUT / TEXTAREA */}

        {isTextarea ? (
          <textarea
            id={inputId}
            {...register(name)} // textarea-specific props
            rows={(props as TextareaVariantProps).rows ?? 3}
            // common props
            placeholder={placeholder}
            maxLength={charLimit}
            aria-required={required || undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            disabled={isSubmitting}
            className="w-full"
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            {...register(name)}
            {...props}
            placeholder={placeholder}
            maxLength={charLimit}
            aria-required={required || undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            disabled={isSubmitting}
            className="w-full"
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      {/* ERROR / HINT */}
      {hasError ? (
        <p id={`${inputId}-error`} className="text-4 text-red-800">
          {errorMessage}
        </p>
      ) : (
        hint && <p className="text-4-medium text-n-800 dark:text-n-100">{hint}</p>
      )}
      {/* CHARACTER COUNTER */}
      {charLimit && (
        <p className="text-5 text-subtle text-right">
          {watch(name)?.length || 0} / {charLimit}
        </p>
      )}
    </div>
  );
};

export default InputForm;
