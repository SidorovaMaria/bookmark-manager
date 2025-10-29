//components/layout/nav/Navigation.tsx
"use client";

/**
 * NavBar — layout wrapper for the app’s Sidebar + Topbar.
 *
 * Responsibilities
 * - Owns the `openSidebar` state.
 * - Renders a backdrop overlay on small screens when the sidebar is open.
 * - Locks body scroll while the sidebar is open (mobile UX).
 * - Closes the sidebar on Escape.
 * - Provides a stable `sidebarId` used for a11y wiring (aria-controls from TopBar).
 *
 * Composition
 * - <SideBar open={openSidebar} setOpen={setOpenSidebar} />
 * - <TopBar setOpenSidebar={setOpenSidebar} />
 */
import React, { useState } from "react";
import clsx from "clsx";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { isInput } from "@/constants";

const Navigation = () => {
  const [openSidebar, setOpenSidebar] = useState(false);

  // Close on Escape
  React.useEffect(() => {
    if (!openSidebar) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isInput) setOpenSidebar(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSidebar]);

  // Prevent body scroll when the sidebar is open (mobile)
  React.useEffect(() => {
    if (openSidebar) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [openSidebar]);

  return (
    <section className="flex w-full items-start sticky top-0 z-50">
      {/* Sidebar (slides in on mobile, static on lg+) */}
      {/* SideBar already handles its own responsive transform; we just pass state */}
      <Sidebar open={openSidebar} setOpen={setOpenSidebar} />
      {/* Screen overlay — only visible on small screens when sidebar is open */}
      <button
        type="button"
        aria-hidden={!openSidebar}
        tabIndex={openSidebar ? 0 : -1}
        onClick={() => setOpenSidebar(false)}
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          openSidebar ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      {/* Top bar (has the hamburger that toggles the sidebar) */}
      <Topbar setOpenSidebar={setOpenSidebar} />
    </section>
  );
};

export default Navigation;
