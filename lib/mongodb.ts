import mongoose, { Mongoose } from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI || "";
if (!MONGODB_URI)
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}
declare global {
  var _mongoose: MongooseCache;
}
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}
/**
 * Establishes a connection to MongoDB using Mongoose with connection caching.
 *
 * This function implements a singleton pattern to reuse existing database connections
 * and avoid creating multiple connections to the same database. It includes development
 * mode debugging and proper error handling.
 *
 * @returns A Promise that resolves to a Mongoose instance representing the database connection
 * @throws Will throw an error if the MongoDB connection fails
 *
 * @example
 * ```typescript
 * try {
 *   const connection = await connectDb();
 *   console.log('Database connected successfully');
 * } catch (error) {
 *   console.error('Failed to connect to database:', error);
 * }
 * ```
 */

const connectDb = async (): Promise<Mongoose> => {
  if (cached.conn) {
    console.log("Using existing connection");
    return cached.conn;
  }
  if (!cached.promise) {
    console.log("Creating new connection");
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "bookmark-manager",
      })
      .then((result) => {
        console.log("Connected to MongoDB");
        return result;
      })
      .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

export { connectDb };
