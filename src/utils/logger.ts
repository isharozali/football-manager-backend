import pino from "pino";
import { env } from "../config/env.js";

const isProd = env.NODE_ENV === "production";

export const logger = pino({
  level: env.LOG_LEVEL ?? (isProd ? "info" : "debug"),
  transport: isProd
    ? undefined
    : {
        target: "pino-pretty",
        options: { colorize: true, singleLine: true },
      },
});
