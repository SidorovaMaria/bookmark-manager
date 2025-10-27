import { getCurrentUser } from "@/auth/actions";
import BookmarksHeader from "@/components/layout/bookmark/BookmarksHeader";
import Navigation from "@/components/layout/nav/Navigation";
import UserProvider, { SafeUserType } from "@/context/provider";
import clsx from "clsx";
import { redirect } from "next/navigation";

import React, { Suspense } from "react";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const user = await getCurrentUser({ redirect: false, userdata: true });
  if (!user) {
    redirect("/sign-in");
  }
  const safeUser: SafeUserType = {
    id: user.user!.id,
    name: user.user!.name,
    email: user.user!.email,
    image: user.user!.image || null,
  };
  return (
    <>
      <UserProvider user={safeUser}>
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
