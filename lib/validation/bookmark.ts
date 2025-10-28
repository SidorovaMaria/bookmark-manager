import z from "zod";
export const bookmarkSchema = z.object({
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
export type bookMarkInput = z.input<typeof bookmarkSchema>;
export type bookMarkOutput = z.output<typeof bookmarkSchema>;

export const bookMarkSaveSchema = bookmarkSchema.extend({
  userId: z.string().min(1, "User ID is required."),
});
export type bookMarkSaveOutput = z.input<typeof bookMarkSaveSchema>;
