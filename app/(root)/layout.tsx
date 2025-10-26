import BookmarksHeader from "@/components/layout/bookmark/BookmarksHeader";
import Navigation from "@/components/layout/nav/Navigation";
import clsx from "clsx";
import React, { Suspense } from "react";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Suspense fallback={<>...</>}>
        <Navigation />
      </Suspense>
      <main
        className={clsx(
          "lg:ml-[296px]",
          "px-4 pt-6 pb-16",
          "md:px-8 md:pt-8 ",
          "flex flex-col  gap-5"
        )}
      >
        <Suspense>
          <BookmarksHeader />
        </Suspense>
        {children}
      </main>
    </>
  );
};

export default MainLayout;
