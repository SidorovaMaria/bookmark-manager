import clsx from "clsx";
import { Check, LucideIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

type NavItemProps = {
  active: boolean;
  label: string;
  icon?: LucideIcon;
  href: string;
  checkbox?: boolean;
  count?: number;
  onToggle?: () => void;
};
const NavItem = ({ active, label, icon, href, checkbox, count, onToggle }: NavItemProps) => {
  const Icon = icon as React.FC<React.SVGProps<SVGSVGElement>>;
  const Component = checkbox ? "div" : Link;
  return (
    <Component
      href={href}
      onClick={() => onToggle?.()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle?.();
        }
      }}
      aria-pressed={active}
      className="flex items-center py-0.5 w-full z-100"
    >
      <div
        className={clsx(
          "flex items-center gap-3 px-3 py-2 rounded-md bg-n-0 dark:bg-n-800 border border-transparent w-full transition-all duration-300 hover:bg-n-100 hover:dark:bg-n-600 hover:border-n-100 hover:dark:border-n-600 cursor-pointer ",
          active &&
            !checkbox &&
            "bg-n-100! dark:bg-n-600! border border-n-100 dark:border-n-600 text-n-0! dark:text-n-900!"
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-2 text-subtle",
            active && "dark:text-n-0! not-dark:text-[#051513]"
          )}
        >
          {!checkbox ? (
            <Icon className="size-5" />
          ) : (
            // <input type="checkbox" checked={active} onChange={onChange} />
            <label className="flex items-center justify-center cursor-pointer relative">
              <input
                type="checkbox"
                checked={active}
                onChange={onToggle}
                className="appearance-none w-4 h-4 rounded-sm border border-n-500 dark:border-n-300 hover:bg-n-300 dark:hover:bg-n-600 focus:focused-ring checked:bg-teal-700 hover:checked:bg-teal-800 checked:border-transparent peer "
              />
              <Check className="size-3 stroke-4 text-white hidden  peer-checked:block  absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </label>
          )}
          <p className={clsx("text-3")}>{label}</p>
        </div>
        {count !== undefined && (
          <div
            className={clsx(
              "ml-auto px-2 py-0.5 rounded-full text-5 bg-n-100 dark:bg-n-600 border border-n-300 "
            )}
          >
            {count}
          </div>
        )}
      </div>
    </Component>
  );
};

export default NavItem;
