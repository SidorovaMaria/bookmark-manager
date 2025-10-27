// auth/hash.ts
/**
 * Password hashing utilities using Node's built-in `crypto` module.
 *
 * Uses `scrypt` for key derivation — a memory-hard algorithm resistant to GPU/ASIC attacks.
 * All returned strings are hex-encoded and normalized for consistent comparison.
 *
 * Each password should be stored alongside its unique salt.
 */
import crypto from "crypto";

/**
 * Hashes a password with a given salt using the scrypt key derivation function.
 *
 * @param password - The plain text password to hash.
 * @param salt - A unique per-user salt string.
 * @returns Promise resolving to a hex-encoded hash string.
 *
 * Time complexity: O(N) where N is scrypt’s internal iteration cost (~moderate but tunable).
 * Space complexity: O(M) where M is scrypt’s memory parameter (default 32–128 MB typical).
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey.toString("hex").normalize());
    });
  });
}

/**
 * Compares a candidate password to a stored hash using constant-time comparison.
 *
 * @param password - The plain text password provided by the user.
 * @param salt - The same salt that was used to hash the stored password.
 * @param storedHash - The stored hex-encoded password hash.
 * @returns `true` if the password matches, `false` otherwise.
 *
 * Security note: uses `crypto.timingSafeEqual` to prevent timing attacks.
 */
export async function comparePassword(
  password: string,
  salt: string,
  storedHash: string
): Promise<boolean> {
  const inputHash = await hashPassword(password, salt);
  const inputBuffer = Buffer.from(inputHash, "hex");
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (inputBuffer.length !== storedBuffer.length) return false; // prevents exceptions
  return crypto.timingSafeEqual(inputBuffer, storedBuffer);
}

/**
 * Generates a cryptographically secure random salt.
 *
 * @returns A 32-character hex string representing 16 random bytes.
 *
 * Complexity: O(1) — single random read from system entropy pool.
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex").normalize();
}
