import dotenv from "dotenv";
dotenv.config();
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Centralized, typed, validated environment configuration
export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    // Accept mongodb:// or mongodb+srv:// URIs
    MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\/.+/, "Invalid MongoDB connection string"),
    JWT_SECRET: z.string().min(10),
    JWT_EXPIRES_IN: z.string().default("15m"),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(12),
    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).optional(),
    CORS_ORIGINS: z
      .string()
      .optional()
      .transform((val) =>
        val
          ? val
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
          : undefined,
      ),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGINS: process.env.CORS_ORIGINS,
  },
});
