/**
 * @fileoverview Test database setup utilities for MongoDB testing with in-memory database.
 * Provides functions to create, clear, and teardown a MongoDB test environment using MongoMemoryServer.
 */

/**
 * Establishes a connection to an in-memory MongoDB instance for testing.
 * Creates a new MongoMemoryServer instance and connects Mongoose to it.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is established
 * @throws {Error} If the MongoDB connection fails
 */

/**
 * Clears all data from all collections in the test database.
 * Ensures test isolation by removing all documents from every collection.
 *
 * @returns {Promise<void>} A promise that resolves when all collections are cleared
 * @throws {Error} If clearing collections fails
 */

/**
 * Closes the MongoDB connection and stops the in-memory server.
 * Performs complete cleanup of the test database environment.
 *
 * @returns {Promise<void>} A promise that resolves when cleanup is complete
 * @throws {Error} If disconnection or server shutdown fails
 */
// __tests__/setupTestDB.ts

import { MongoMemoryServer } from "mongodb-memory-server"; //spins up a throwaway MongoDB in RAM
import mongoose from "mongoose"; //MongoDB ORM

// We'll keep a reference to the in-memory server so we can stop it after tests.
let mongo: MongoMemoryServer;

export async function connectTestDb() {
  // 1) Start a brand-new MongoDB instance in memory (no local install or Atlas needed).
  mongo = await MongoMemoryServer.create();
  // 2) Ask it for a connection URI (random port, unique DB path in RAM).
  const uri = mongo.getUri();
  // 3) Connect mongoose to that URI.
  await mongoose.connect(uri, { dbName: "test" });
}

export async function clearDb() {
  // 4) For isolation between tests, wipe all collections (tables) before each test.
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}
export async function disconnectTestDb() {
  await mongoose.connection.close();
  // 6) Stop the in-memory Mongo server; all data vanishes — perfect cleanliness.
  if (mongo) await mongo.stop();
}
