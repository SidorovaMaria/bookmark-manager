// components/layout/ProfileMenu.tsx
"use client";
/**
 * ProfileMenu — compact user panel for dropdowns/menus.
 *
 * Includes:
 * - User identity block (avatar, name, email)
 * - Theme toggle row
 * - Logout row (button)
 *
 * Integration:
 * - Designed to live inside a dropdown (e.g., Radix <DropdownMenu.Content>).
 * - Call `closeDropdown?.()` after actions to collapse the menu.
 *
 * Accessibility:
 * - Logout is a proper <button> with aria-label.
 * - Avatar has descriptive alt text.
 */
import Image from "next/image";
import ThemeToggle from "../ui/ThemeToggle";
import { LogOut, Palette } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
type ProfileMenuProps = {
  user: {
    name: string;
    /** Public path or remote URL; if it fails, we show a fallback. */
    avatar: string;
    email: string;
  };
  /** Close the parent dropdown/popover after an action (optional). */
  closeDropdown?: () => void;
  /** Logout handler. If omitted, the Logout row renders disabled. */
  onLogout?: () => Promise<void> | void;
};
const ProfileMenu = ({ user, closeDropdown, onLogout }: ProfileMenuProps) => {
  const fallbackAvatarSrc = "/images/fallback-avatar.jpg";
  const [avatarSrc, setAvatarSrc] = useState<string>(user.avatar);
  // TODO : Add Logout functionality
  const handleLogout = async () => {
    if (!onLogout) return;
    try {
      await onLogout();
    } finally {
      // Close the menu regardless of success; adjust if you want to keep it open on error
      closeDropdown?.();
    }
  };

  return (
    <>
      {/* Profile Information */}
      <div className="flex items-center px-4 py-3 gap-3 border-b border-b-[#E9EAEB] dark:border-b-n-500">
        <Image
          src={avatarSrc || fallbackAvatarSrc}
          alt={`${user.name} avatar`}
          width={40}
          height={40}
          className="rounded-full object-cover"
          onError={() => setAvatarSrc(fallbackAvatarSrc)}
          priority
        />
        <div className="flex flex-col ">
          <p className="text-4">{user.name}</p>
          <p className="text-4-medium text-subtle">{user.email}</p>
        </div>
      </div>
      {/* Toggle Theme */}
      <div className="px-2 py-1">
        <div className="p-1 rounded-md flex items-center gap-2.5">
          <Palette className="size-4 text-subtle" aria-hidden />
          <p className="text-4-medium text-subtle">Theme</p>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
      {/* Logout Button */}
      <div className="px-2 py-1 border-t border-t-[#E9EAEB] dark:border-t-n-500">
        <button
          type="button"
          onClick={handleLogout}
          disabled={!onLogout}
          className={clsx(
            "w-full p-2 inline-flex items-center gap-2.5 rounded-md",
            "text-left text-4-medium text-subtle transition-colors",
            "hover:bg-n-100 dark:hover:bg-n-500 focus:focus-ring"
          )}
          aria-label="Log out"
        >
          <LogOut className="size-4 text-subtle" aria-hidden />
          <span className="w-full">Log Out</span>
        </button>
      </div>
    </>
  );
};
export default ProfileMenu;
