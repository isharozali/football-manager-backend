import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayloadShape {
  sub: string; // user id
  iat?: number;
  exp?: number;
}

const secret = env.JWT_SECRET;
const expiresIn = env.JWT_EXPIRES_IN;

export function signAccessToken(subjectUserId: string): string {
  const payload: JwtPayloadShape = { sub: subjectUserId };
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string): JwtPayloadShape {
  const decoded = jwt.verify(token, secret);
  // jwt.verify returns string | jwt.JwtPayload; we enforce our shape
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const sub = decoded.sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new Error("Invalid token subject");
  }
  return { sub, iat: decoded.iat, exp: decoded.exp };
}


