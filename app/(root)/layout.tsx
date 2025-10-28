import { getCurrentUser } from "@/auth/actions";
import BookmarksHeader from "@/components/layout/bookmark/BookmarksHeader";
import Navigation from "@/components/layout/nav/Navigation";
import { UserProvider } from "@/context/provider";
import { getAllUserTags } from "@/lib/actions/bookmark.action";
import { IUser } from "@/models/User";

import clsx from "clsx";
import { redirect } from "next/navigation";

import React, { Suspense } from "react";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = (await getCurrentUser({ redirect: false, userdata: true })) as {
    user: IUser;
  } | null;
  if (!user) {
    redirect("/sign-in");
  }
  const tags = await getAllUserTags();
  return (
    <>
      <UserProvider user={user.user} tags={tags.ok ? tags.tags : []}>
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
      </UserProvider>
    </>
  );
};

export default MainLayout;
