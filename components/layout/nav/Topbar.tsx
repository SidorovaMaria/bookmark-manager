// components/nav/TopBar.tsx
/**
 * * TopBar — global header with:
 * - sidebar toggle (mobile)
 * - debounced search synced to the URL (?search=…)
 * - “Add Bookmark” modal trigger
 * - profile dropdown (avatar + menu)
 *  * Notes:
 * - Uses `router.replace` to avoid filling browser history while typing.
 * - Preserves existing query params when updating `search`.
 * - Debounce reduces URL churn and unnecessary rerenders/data fetches.
 * - Accessible controls: labelled buttons, focus-rings, proper roles.
 
 */

"use client";
import * as React from "react";
import clsx from "clsx";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Menu, Plus, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FormModal from "@/components/ui/FormModal";
import BookmarkForm from "../bookmark/BookmarkForm";
import DropDown from "@/components/ui/DropDown";
import ProfileMenu, { fallbackAvatarSrc } from "../ProfileMenu";
import { useDebounce } from "@/hooks/useDebounce";
import { logOut } from "@/auth/actions";
import { useUser } from "@/context/provider";
import { toast } from "@/components/ui/Toast";

type TopBarProps = {
  /** Controls the sidebar on small screens. */
  setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
};

const Topbar = ({ setOpenSidebar }: TopBarProps) => {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local search state mirrors the current ?search= param
  const [search, setSearch] = React.useState<string>(searchParams.get("search") ?? "");
  const debounced = useDebounce(search, 300);

  // Keep local state in sync if the URL changes externally
  React.useEffect(() => {
    const fromUrl = searchParams.get("search") ?? "";
    // Avoid cursor jump while typing by only updating if values diverge
    if (fromUrl !== search) setSearch(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced) params.set("search", debounced);
    else params.delete("search");

    const next = `${pathname}?${params.toString()}`;
    const current = `${pathname}?${searchParams.toString()}`;
    if (next !== current) router.replace(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, pathname, router]);
  const handleLogout = async () => {
    toast({
      title: "Logging out...",
      icon: "check",
    });
    await logOut();
  };
  return (
    <header
      role="banner"
      className={clsx(
        "flex w-full items-center gap-2.5 border-b border-b-n-300 bg-n-0 px-4 py-3 ",
        "dark:bg-n-800 dark:border-b-n-500 ",
        "md:px-8 md:py-4 md:justify-between md:items-center ",
        "lg:max-w-[calc(100%-[296px])] lg:ml-auto"
      )}
    >
      {/* Left: Menu + Search */}
      <div className="flex flex-1 items-center gap-2.5 md:gap-4 lg:ml-[296px]">
        {/* Mobile/Tablet sidebar toggle */}
        <Button
          tier="secondary"
          size="md"
          aria-label="Toggle sidebar"
          // Sidebar has id="sidebar"
          aria-controls={"sidebar"}
          onClick={() => setOpenSidebar((prev) => !prev)}
          className="lg:hidden min-w-10! h-10! md:min-w-11! md:h-11!"
          icon={<Menu className="size-5 text-n-900 dark:text-n-0" />}
        />
        {/* Search input — debounced to URL */}
        <Input
          id="topbar-search"
          type="search"
          inputMode="search"
          placeholder="Search by title..."
          icon={Search}
          value={search}
          className="shadow-none! border-n-300! dark:border-n-500! max-w-[320px]! "
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && search) setSearch("");
          }}
        />
      </div>
      {/* Right: Add bookmark + Profile */}
      <div className="flex items-center gap-2.5 md:gap-4">
        <FormModal
          title="Add Bookmark"
          description="Save a link with details to keep your collection organized."
          modalContent={<BookmarkForm />}
        >
          <Button
            tier="primary"
            size="md"
            className="max-sm:p-2.5! "
            iconPosition="left"
            icon={<Plus className="size-5 text-n-0" aria-hidden />}
          >
            <span className="hidden md:block text-3">Add Bookmark</span>
          </Button>
        </FormModal>

        <DropDown dropDownContent={<ProfileMenu user={user} onLogout={handleLogout} />}>
          <Image
            src={user.image || fallbackAvatarSrc}
            alt="Open profile menu"
            width={40}
            height={40}
            className="rounded-full cursor-pointer w-auto h-auto"
            priority
          />
        </DropDown>
      </div>
    </header>
  );
};

export default Topbar;
