import BookmarksHeader from "@/components/layout/bookmark/BookmarksHeader";
import Navigation from "@/components/layout/nav/Navigation";
import clsx from "clsx";
import React from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navigation />
      <main
        className={clsx(
          "lg:ml-[296px]",
          "px-4 pt-6 pb-16",
          "md:px-8 md:pt-8 ",
          "flex flex-col  gap-5"
        )}
      >
        <BookmarksHeader />
        {children}
      </main>
    </>
  );
};

export default MainLayout;
