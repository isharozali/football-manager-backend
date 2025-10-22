import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";
import { httpErrorHandler, notFoundHandler } from "../middlewares/error";
import { successResponder } from "../middlewares/success";
import { router as apiRouter } from "../routes";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export function buildApp(): Application {
  const app = express();

  app.use(helmet());
  const allowlist = env.CORS_ORIGINS || [];
  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (!allowlist || allowlist.includes(origin)) return callback(null, true);
        return callback(new Error("CORS not allowed"));
      },
      credentials: true,
    }),
  );

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  app.use(
    pinoHttp({
      logger,
      customSuccessMessage: function () {
        return "request completed";
      },
      customErrorMessage: function () {
        return "request errored";
      },
    }),
  );

  app.use(express.json({ limit: "1mb" }));

  app.use(successResponder);

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ success: true, message: "ok" });
  });

  app.use("/api", apiRouter);

  app.use(notFoundHandler);

  app.use(httpErrorHandler);

  return app;
}
