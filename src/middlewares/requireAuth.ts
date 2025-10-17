import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { verifyAccessToken } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: "Missing Authorization header" });
    return;
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.sub;
    next();
  } catch (_e) {
    res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired token" });
  }
}
