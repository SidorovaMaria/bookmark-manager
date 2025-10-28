import { DEFAULT_ERROR } from "@/constants";
import { LucideIcon } from "lucide-react";

import React from "react";
interface Props<T> {
  success: boolean;
  error?: {
    title: string;
    message: string;
    icon: LucideIcon;
  };
  data: T[] | null | undefined;
  empty: {
    title: string;
    message: string;
    icon: LucideIcon;
  };
  render: (data: T[]) => React.ReactNode;
}
const ErrorEmptySkeleton = ({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: LucideIcon;
}) => {
  const Icon = icon as LucideIcon;
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 text-center gap-4">
      <h2 className="text-2 md:text-1 ">{title}</h2>
      <p className="text-subtle text-3">{message}</p>
      <Icon className="size-10 mt-4 " />
    </div>
  );
};

const DataRenderer = <T,>({ success, error = DEFAULT_ERROR, data, empty, render }: Props<T>) => {
  if (!success) {
    return <ErrorEmptySkeleton title={error.title} message={error.message} icon={error.icon} />;
  }
  if (!data || data.length === 0) {
    return <ErrorEmptySkeleton title={empty.title} message={empty.message} icon={empty.icon} />;
  }
  return <>{render(data)}</>;
};

export default DataRenderer;
