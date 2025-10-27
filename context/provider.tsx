"use client";
import React from "react";

export type SafeUserType = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};
const UserContext = React.createContext<SafeUserType | null>(null);
export default function UserProvider({
  user,
  children,
}: {
  user: SafeUserType;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
export function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
}
