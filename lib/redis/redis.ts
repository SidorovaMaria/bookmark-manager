import { createClient } from "redis";
const redisURL = process.env.REDIS_URL;
if (!redisURL) {
  throw new Error("REDIS_URL is not defined in environment variables");
}
export const redisClient = await createClient({ url: redisURL }).connect();
