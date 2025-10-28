// components/layout/bookmark/BookmarkCard.tsx
"use client";
/**
 * * BookmarkCard — presentational card for a single bookmark.
 *
 * * Responsibilities
 * - Show favicon, title, URL, description, tags, and lightweight meta (visits, last visited, created).
 *
 */
import Image from "next/image";
import { format } from "date-fns";
import { Calendar, Clock2, EllipsisVerticalIcon, Eye, Pin } from "lucide-react";

import { useState } from "react";
import DropDown from "@/components/ui/DropDown";
import Button from "@/components/ui/Button";
import Tag from "@/components/ui/Tag";
import FormModal from "@/components/ui/FormModal";
import BookmarkForm from "./BookmarkForm";
import BookmarkDropdown from "./BookmarkDropdown";
import { IBookmark } from "@/models/Bookmark";

//
const BookMarkCard = ({ bookmark }: { bookmark: IBookmark }) => {
  const { title, url, favicon, description, tags, isArchived, pinned } = bookmark;
  const createdAt = format(new Date(bookmark.createdAt!), "dd MMM");
  const lastVisited = bookmark.lastVisitedAt
    ? format(new Date(bookmark.lastVisitedAt), "dd MMM")
    : "Never";
  const [edit, setEdit] = useState(false);
  return (
    <div
      role="feed"
      className="bg-n-0 dark:bg-n-800 rounded-xl card-shadow max-w-[336px] flex flex-col overflow-hidden"
    >
      {/* Container */}
      <div className="flex flex-col p-4 gap-4 rounded-[10px] flex-1">
        {/* Header */}
        <div className="flex items-center w-full gap-3">
          <div className="w-10 h-10 rounded-md relative border border-n-100 dark:border-n-500 shrink-0">
            <Image
              src={favicon || "/images/fallback-avatar.jpg"}
              alt={`${title} favicon`}
              fill
              sizes="38"
              className="rounded-md"
            />
          </div>
          <div className="flex flex-col gap-1 w-full ">
            <p className="text-2">{title}</p>
            <p className="text-5 text-subtle">{url}</p>
          </div>
          <DropDown
            dropDownContent={
              <BookmarkDropdown
                isPinned={bookmark.pinned}
                isArchived={isArchived}
                bookmark={bookmark}
                setEdit={setEdit}
              />
            }
          >
            <Button
              icon={<EllipsisVerticalIcon className="size-5" />}
              tier="secondary"
              size="sm"
              className="place-self-start"
            />
          </DropDown>
        </div>
        <hr className="divider" />
        <p className="text-4-medium text-subtle">{description}</p>
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex gap-2">
            {tags.map((tag, index) => (
              <Tag key={index} tag={tag} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t  border-n-300 dark:border-n-500 px-4 py-3 flex items-center gap-2">
        <div className="w-full gap-4 flex items-center">
          {SnapShot(<Eye className="size-3 text-subtle" />, bookmark.visitCount)}
          {SnapShot(<Clock2 className="size-3 text-subtle" />, lastVisited)}
          {SnapShot(<Calendar className="size-3 text-subtle" />, createdAt)}
        </div>
        {isArchived && <Tag tag="Archived" />}
        {pinned && !isArchived && <Pin className="size-4 text-subtle" />}
      </div>
      <FormModal
        title="Edit Bookmark"
        description="Make changes to your bookmark."
        modalContent={<BookmarkForm bookmark={bookmark} closeForm={() => setEdit(false)} />}
        open={edit}
        onOpenChange={setEdit}
      />
    </div>
  );
};

export default BookMarkCard;
const SnapShot = (icon: React.ReactNode, value: number | string) => {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <span className="text-5 text-subtle">{value}</span>
    </div>
  );
};
