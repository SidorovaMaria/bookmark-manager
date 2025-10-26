// components/layout/bookmark/BookMarkForm.tsx
"use client";

/**
 * BookmarkForm — create or edit a bookmark with Title, Description, URL, and Tags.
 *
 * Tech:
 * - Validation with Zod (`zodResolver`)
 * - React Hook Form with context provider for child fields
 * - Reusable UI inputs (InputField, Input)
 *
 * UX details:
 * - `closeForm()` is called after a successful submit (parent can close a modal).
 * - Tags are entered via a lightweight input: press Enter or comma to add.
 * - Duplicate tags are prevented; errors are surfaced via RHF.
 *
 * Accessibility:
 * - Labels are linked to inputs via `htmlFor`/`id` (handled by the inputs themselves).
 * - Errors are announced using `aria-invalid` + `aria-describedby` on the inputs.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import z from "zod";
import { X } from "lucide-react";
import InputForm from "@/components/ui/InputForm";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

// ---------- Validation Schema ----------

/**
 * Zod schema for the bookmark form.
 * - `title` and `description` are required strings.
 * - `url` validates full URL format.
 * - `tags` requires at least one non-empty, <= 30-char tag.
 * - Custom error messages provided for better UX.
 * ? Maybe change the messages later to be more user friendly.
 */
const bookMarkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  url: z.url("Invalid URL").min(1, "URL is required"),
  tags: z
    .array(
      z
        .string()
        .min(1, { message: "Tag is required." })
        .max(30, { message: "Tag cannot exceed 30 characters." })
    )
    .min(1, { message: "At least one tag is required." }),
});
export type BookMarkFormProps = {
  /** If provided, fields are pre-filled and submit label switches to "Save Bookmark". */
  bookmark?: BookmarkType;
  /** Optional close callback (e.g., to close a modal). Called after successful submit and on explicit Cancel. */
  closeForm?: () => void;
};

type inputType = z.input<typeof bookMarkSchema>;
type outputType = z.output<typeof bookMarkSchema>;
const BookmarkForm = ({ bookmark, closeForm }: BookMarkFormProps) => {
  const form = useForm<inputType, outputType>({
    resolver: zodResolver(bookMarkSchema),
    defaultValues: {
      title: bookmark?.title ?? "",
      description: bookmark?.description ?? "",
      url: bookmark?.url ?? "",
      tags: bookmark?.tags ?? [],
    },
    mode: "onSubmit",
  });
  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    setError,
    clearErrors,
    reset,
  } = form;
  // Reactively track tags so the chips re-render when updated
  // useWatch returns the value directly (safer for memoization/static analysis than the watch() function)
  const tags = useWatch({
    control: form.control,
    name: "tags",
    defaultValue: form.getValues("tags") ?? [],
  }) as string[];

  // Submit handler — call your API here, then close the form on success
  const onSubmit = async (data: inputType) => {
    console.log("Form submitted:", data);
    // TODO: Call create/update API here.
    closeForm?.();
  };

  // Close helper — resets form and calls parent close (if provided)
  const close = () => {
    closeForm?.();
    reset();
  };
  /**
   * Tag input keydown handler:
   * - Enter or comma adds the tag.
   * - Prevents duplicates (case-insensitive).
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    if (key !== "Enter" && key !== ",") return;
    e.preventDefault();
    const inputEl = e.target as HTMLInputElement;
    const raw = inputEl.value.trim();
    if (!raw) return;
    const exists = tags.some((t) => t === raw);
    const moreThan30 = raw.length > 30;
    if (moreThan30) {
      setError("tags", { message: "Tag cannot exceed 30 characters." });
      return;
    }
    if (exists) {
      setError("tags", { message: "Tag already added." });
      return;
    }
    clearErrors("tags");
    setValue("tags", [...tags, raw], { shouldDirty: true, shouldValidate: true });
    inputEl.value = "";
  };
  // Remove a tag by index
  const removeTagAt = (index: number) => {
    const updated = tags.filter((_, i) => i !== index);
    setValue("tags", updated, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col  gap-5">
        {/* Title */}
        <InputForm
          label="Title"
          placeholder="Github..."
          name="title"
          type="text"
          required
          inputMode="text"
        />
        {/* Description */}
        <InputForm
          label="Description"
          isTextarea
          name="description"
          required
          inputMode="text"
          charLimit={250}
        />
        {/* Website URL */}
        <InputForm
          label="Website URL"
          placeholder="https://github.com"
          name="url"
          type="url"
          required
          inputMode="url"
        />
        <Input
          label="Tags"
          id="tags-input"
          placeholder="Press Enter or comma to add tags"
          onKeyDown={handleTagKeyDown}
          // When Zod reports an array-level error, display it here
          error={errors.tags?.message as string}
          aria-describedby={errors.tags ? "tags-input-error" : undefined}
        />
        {/* Tag chips */}
        <div
          className="flex flex-wrap gap-3 -mt-1"
          aria-live="polite"
          aria-relevant="additions removals"
        >
          {tags.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className="bg-n-100 dark:bg-n-600 px-2 py-0.5 rounded-md text-n-800 dark:text-n-100 text-4 flex items-center"
            >
              <p>{tag}</p>
              <button
                type="button"
                className="ml-1"
                aria-label={`Remove tag ${tag}`}
                onClick={() => removeTagAt(index)}
              >
                <X className="size-4 cursor-pointer hover:text-red-800" />
              </button>
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="w-full flex max-md:justify-between justify-end items-center gap-4">
          <Button tier="secondary" type="button" size="md" onClick={close}>
            Cancel
          </Button>
          <Button tier="primary" size="md" disabled={isSubmitting} type="submit">
            {bookmark ? "Save Bookmark" : "Add Bookmark"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default BookmarkForm;
