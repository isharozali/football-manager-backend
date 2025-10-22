import http from "http";
import { buildApp } from "./app/app";
import { logger } from "./utils/logger";
import { connectToDatabase } from "./config/database";
import { env } from "./config/env";
import { processJobs } from "./jobs/worker";

const port = env.PORT;

async function start(): Promise<void> {
  await connectToDatabase();

  processJobs().catch((e) => {
    logger.error({ e }, "Worker fatal error");
    process.exitCode = 1;
  });

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
