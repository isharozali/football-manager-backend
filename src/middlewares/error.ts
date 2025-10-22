import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { logger } from "../utils/logger";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(_req: Request, res: Response, _next: NextFunction): void {
  res.status(httpStatus.NOT_FOUND).json({ message: "Route not found" });
}

export function httpErrorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      details: err.details,
      code: "HTTP_ERROR",
      statusCode: err.statusCode,
    });
    return;
  }

  logger.error({ err }, "Unhandled error");
  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
    statusCode: httpStatus.INTERNAL_SERVER_ERROR,
  });
}
