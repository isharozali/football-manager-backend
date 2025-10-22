import { logger } from "../utils/logger";
import { JobModel } from "../models/job.model";
import { createTeamForUser } from "../services/team.service";

export async function processJobs(): Promise<void> {
  logger.info("Worker started");

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
