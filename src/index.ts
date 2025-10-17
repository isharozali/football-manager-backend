import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { buildApp } from "./app/app.js";
import { logger } from "./utils/logger.js";
import { connectToDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const port = env.PORT;

async function start(): Promise<void> {
  // Initialize MongoDB connection first to fail fast if misconfigured
  await connectToDatabase();

  const app = buildApp();
  const server = http.createServer(app);

  server.listen(port, () => {
    logger.info({ port }, `Server listening on port ${port}`);
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Graceful shutdown initiated");
    server.close((err) => {
      if (err) {
        logger.error({ err }, "Error closing server");
      }
    });
    // Close mongoose connection
    try {
      const { default: mongoose } = await import("mongoose");
      await mongoose.connection.close();
      logger.info("Mongo connection closed");
    } catch (e) {
      logger.error({ e }, "Error closing Mongo connection");
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  logger.error({ error }, "Fatal startup error");
  process.exitCode = 1;
});


