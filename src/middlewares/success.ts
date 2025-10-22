import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

declare global {
  namespace Express {
    interface Response {
      success: (data?: unknown, message?: string, statusCode?: number) => void;
    }
  }
}

export function successResponder(_req: Request, res: Response, next: NextFunction): void {
  res.success = (data?: unknown, message?: string): void => {
    res.status(httpStatus.OK).json({ success: true, data, message, statusCode: httpStatus.OK });
  };

  next();
}
