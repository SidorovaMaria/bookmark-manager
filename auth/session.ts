// auth/session.ts
/**
 * Session utilities using Redis for storage.
 *
 * Each active session is stored as:
 *    session:{sessionId} → userId
 *
 * A secure, HttpOnly cookie holds the session id in the client.
 * Expiration: 7 days (auto-removed by Redis on TTL expiry).
 */

import crypto from "crypto";
import { redisClient } from "@/lib/redis/redis";

/** 7 days in seconds. */
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 7;
/** Cookie key for storing the session id. */
const COOKIE_SESSION_KEY = "session-id";
/** Redis key prefix for sessions. */
const REDIS_SESSION_PREFIX = "session:";

/**
 * Creates a new session for a user and stores it in Redis.
 *
 * @param userId - The user’s unique identifier (string or UUID).
 * @param cookies - A minimal cookie helper (Next.js compatible).
 *
 * The function:
 * 1. Generates a 512-byte random session id.
 * 2. Stores it in Redis under `session:{sessionId}` with a 7-day TTL.
 * 3. Sets an HttpOnly cookie containing that session id.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export async function createUserSession(
  userId: string,
  cookies: Pick<Cookies, "set">
): Promise<void> {
  const sessionId = crypto.randomBytes(512).toString("hex").normalize();
  await redisClient.set(`${REDIS_SESSION_PREFIX}${sessionId}`, userId, {
    EX: SESSION_EXPIRATION_SECONDS,
  });
  cookies.set(COOKIE_SESSION_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: "lax",
    expires: Date.now() + SESSION_EXPIRATION_SECONDS * 1000,
  });
}

/**
 * Retrieves a user id from the current session cookie.
 *
 * @param cookies - cookie type with a `get` method.
 * @returns The user id string or `null` if no valid session exists.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export async function getUserFromSession(cookies: Pick<Cookies, "get">): Promise<string | null> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return null;
  return getUserSessionById(sessionId);
}

/**
 * Looks up a user id by session id in Redis.
 *
 * @param sessionId - The stored session id.
 * @returns The associated user id or `null` if expired or invalid.
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */

async function getUserSessionById(sessionId: string): Promise<string | null> {
  const userId = await redisClient.get(`${REDIS_SESSION_PREFIX}${sessionId}`);
  return userId || null;
}

/**
 * Removes a user’s session from Redis and clears the session cookie.
 *
 * @param cookies - A minimal cookie helper (must support .get() and .delete()).
 *
 * Time complexity: O(1)
 * Space complexity: O(1)
 */
export async function removeUserFromSession(
  cookies: Pick<Cookies, "get" | "delete">
): Promise<void> {
  const sessionId = cookies.get(COOKIE_SESSION_KEY)?.value;
  if (!sessionId) return;
  await redisClient.del(`${REDIS_SESSION_PREFIX}${sessionId}`);
  cookies.delete(COOKIE_SESSION_KEY);
}
