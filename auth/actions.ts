// auth/actions.ts
"use server";
import { cache } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { connectDb } from "@/lib/mongodb";
import { SignInOutput, signInSchema, SignupOutput, signupSchema } from "@/lib/validation/auth";
import { IUser, User } from "@/models/User";
import { comparePassword, generateSalt, hashPassword } from "./hash";
import { createUserSession, getUserFromSession, removeUserFromSession } from "./session";
/**
 * Auth server actions
 *
 * Sign-in / Sign-up create a session in Redis and set a secure HttpOnly cookie.
 * getCurrentUser returns `{ user }` or `null`. When `redirect: true`, unauthenticated requests redirect to /sign-in.
 *
 * Time complexity (per call):
 *  - DB lookups O(1) average (indexed query by email/_id)
 *  - Hash/compare O(C) where C is the scrypt cost (memory-hard)
 * Space complexity: O(1)
 */

/**
 * Sign-in and establish a session.
 *
 * @param formData - parsed client payload validated by Zod schema
 * @returns void (redirects on success) or string error
 */

export async function signIn(formData: SignInOutput): Promise<{ ok: true } | { error: string }> {
  const { success, data } = signInSchema.safeParse(formData);
  if (!success) return { error: "Invalid form data." };

  const { email, password } = data;

  try {
    await connectDb();
    const userExist = await User.findOne({ email }).select("_id salt passwordHash");
    if (!userExist) {
      return { error: "Invalid credentials." };
    }
    const isPasswordValid = await comparePassword(password, userExist.salt, userExist.passwordHash);
    if (!isPasswordValid) {
      return { error: "Invalid credentials." };
    }
    await createUserSession(userExist._id.toString(), await cookies());
    return { ok: true };
  } catch {
    return { error: "Internal server error during sign-in." };
  }
}

/**
 * Sign-up and establish a session for the new user.
 *
 * @param formData - parsed client payload validated by Zod schema
 * @returns void (redirects on success) or string error
 */
export async function signUp(formData: SignupOutput): Promise<{ ok: true } | { error: string }> {
  const { success, data } = signupSchema.safeParse(formData);
  if (!success) return { error: "Invalid form data." };
  const { name, email, password } = data;
  try {
    await connectDb();

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return { error: "Email is already registered." };
    }
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);
    const user = await User.create({
      name,
      email,
      passwordHash: hashedPassword,
      salt,
    });
    if (!user) {
      return { error: "Failed to create user." };
    }

    await createUserSession(String(user._id), await cookies());
    return { ok: true };
  } catch {
    return { error: "Internal server error during sign-up." };
  }
}
/**
 * Log out the current user by deleting their session and clearing the cookie.
 */
export async function logOut() {
  await removeUserFromSession(await cookies());
}
/**
 * Internal: fetch the current user (optionally redirect if missing).
 *
 * @param options.redirect - if true, redirect to /sign-in when unauthenticated
 * @param options.userdata - if true, returns full user doc (minus sensitive fields)
 * @returns `{ user }` or `null`
 */

async function _getCurrentUser(options?: { redirect?: boolean; userdata?: boolean }) {
  const userId = await getUserFromSession(await cookies());
  if (!userId) {
    if (options?.redirect) redirect("/sign-in");
    return null;
  }
  try {
    await connectDb();
    if (options?.userdata) {
      // exclude sensitive internals; lean() returns a plain object
      const user = await User.findById(userId).select("-passwordHash -salt -__v");

      if (!user) {
        // If the session exists but the user was deleted, treat as unauthenticated
        if (options?.redirect) redirect("/sign-in");
        return null;
      }

      return {
        user: JSON.parse(JSON.stringify(user)) as IUser,
      };
    }

    // Caller only needs to know that a valid user exists
    return { user: userId };
  } catch {
    if (options?.redirect) redirect("/sign-in");
    return null;
  }
}

// Memoized variant for server components/actions that call this frequently
export const getCurrentUser = cache(_getCurrentUser);
