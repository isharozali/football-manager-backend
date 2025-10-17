import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cors from "cors";
import pinoHttp from "pino-http";
import { logger } from "../utils/logger";
import { httpErrorHandler, notFoundHandler } from "../middlewares/error";
import { router as apiRouter } from "../routes";
import rateLimit from "express-rate-limit";
import { env } from "../config/env";

export function buildApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS with allowlist
  const allowlist = env.CORS_ORIGINS;
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

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Request logging
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

  // JSON body parsing
  app.use(express.json({ limit: "1mb" }));

  // Health endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
  });

  // API routes
  app.use("/api", apiRouter);

  // 404 handler
  app.use(notFoundHandler);

  // Error handler (must be last)
  app.use(httpErrorHandler);

  return app;
}
