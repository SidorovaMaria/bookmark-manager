import Logo from "@/components/ui/Logo";
import clsx from "clsx";
import { ReactNode } from "react";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <main className="w-screen h-screen flex-center px-4">
      <div
        className={clsx(
          "w-full md:max-w-md flex flex-col gap-8 px-5 py-8 rounded-xl shadow-[0_2px_4px] shadow-[rgba(21,21,21,0.06)]",
          " bg-n-0 dark:bg-n-800 dark:border dark:border-n-500"
        )}
      >
        <Logo />
        {children}
      </div>
    </main>
  );
};

export default AuthLayout;
