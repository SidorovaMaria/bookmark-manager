"use client";
import { IUser } from "@/models/User";
import React from "react";

export type SafeUserType = Omit<IUser, "passwordHash" | "salt">;
export type Tag = {
  name: string;
  count: number;
};

type UserContextValue = {
  user: SafeUserType;
  tags: Tag[];
};

const UserContext = React.createContext<UserContextValue | null>(null);

export function UserProvider({
  user,
  tags,
  children,
}: {
  user: SafeUserType;
  tags: Tag[];
  children: React.ReactNode;
}) {
  // Memoize to avoid rerenders of consumers when parent rerenders with same refs
  const value = React.useMemo(() => ({ user, tags }), [user, tags]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/** Access both user and tags */
export function useUserContext() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within <UserProvider>");
  return ctx;
}

/** Access just the user */
export function useUser() {
  return useUserContext().user;
}

/** Access just the tags */
export function useUserTags() {
  return useUserContext().tags;
}
