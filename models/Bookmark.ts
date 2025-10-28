import { Document, model, models, Schema, Types } from "mongoose";

export interface IBookmark extends Document {
  userId: Types.ObjectId;
  title: string;
  url: string;
  favicon: string;
  description: string;
  tags: string[];
  pinned: boolean;
  isArchived: boolean;
  visitCount: number;
  lastVisitedAt: Date;
  createdAt: Date;
  demo?: boolean;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
    demo: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    visitCount: { type: Number, default: 0 },
    lastVisitedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Bookmark = models.Bookmark || model<IBookmark>("Bookmark", BookmarkSchema);
