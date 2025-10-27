import { Document, model, models, Schema } from "mongoose";

export interface IBookmark extends Document {
  title: string;
  url: string;
  favicon: string;
  description: string;
  tags: string[];
  pinned: boolean;
  isArchived: boolean;
  visitCount: number;
  lastVisitedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    favicon: { type: String, trim: true },
    description: { type: String, trim: true, required: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: "At least one tag is required.",
      },
    },
    pinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    visitCount: { type: Number, default: 0 },
    lastVisitedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Bookmark = models.Bookmark || model<IBookmark>("Bookmark", BookmarkSchema);
