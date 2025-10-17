import dotenv from "dotenv";
dotenv.config();

import { logger } from "../utils/logger";
import { connectToDatabase } from "../config/database";
import { JobModel } from "../models/job.model";
import { createTeamForUser } from "../services/team.service";

async function processJobs(): Promise<void> {
  await connectToDatabase();
  logger.info("Worker started");

  // Simple polling worker; in production, use a robust queue
  // Poll every 1s for pending jobs scheduled in the past
  // Use findOneAndUpdate to lock the job atomically
  // Limit attempts for resilience
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const job = await JobModel.findOneAndUpdate(
      { status: "pending", scheduledAt: { $lte: new Date() } },
      { $set: { status: "processing" }, $inc: { attempts: 1 } },
      { new: true },
    ).exec();

    if (!job) {
      await new Promise((r) => setTimeout(r, 1000));
      continue;
    }

    try {
      if (job.type === "create-team") {
        const payload = job.payload as { userId?: string };
        if (typeof payload.userId !== "string") {
          throw new Error("Invalid payload");
        }
        await createTeamForUser(payload.userId);
      } else {
        logger.warn({ type: job.type }, "Unknown job type");
      }
      job.status = "completed";
      job.lastError = undefined;
      await job.save();
    } catch (e) {
      job.status = job.attempts >= 3 ? "failed" : "pending";
      job.lastError = e instanceof Error ? e.message : "Unknown error";
      if (job.status === "pending") {
        job.scheduledAt = new Date(Date.now() + 2000);
      }
      await job.save();
    }
  }
}

processJobs().catch((e) => {
  logger.error({ e }, "Worker fatal error");
  process.exitCode = 1;
});


