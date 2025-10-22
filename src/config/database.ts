import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { env } from "./env.js";

export async function connectToDatabase(): Promise<void> {
  // Recommended options for modern drivers
  mongoose.set("strictQuery", true);

  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
    dbName: "football_manager",
  });

  logger.info({ mongoUri: env.MONGODB_URI }, "Connected to MongoDB");
}
