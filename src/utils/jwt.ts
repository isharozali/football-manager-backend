import jwt, { type SignOptions, type Secret } from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayloadShape } from "../interfaces";
import type { StringValue } from "../types";

const secret = env.JWT_SECRET;
const expiresIn = env.JWT_EXPIRES_IN;

export function signAccessToken(subjectUserId: string): string {
  const payload: JwtPayloadShape = { sub: subjectUserId };
  const options: SignOptions = { expiresIn: expiresIn as StringValue };
  return jwt.sign(payload, secret as Secret, options);
}

export function verifyAccessToken(token: string): JwtPayloadShape {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string") {
    throw new Error("Invalid token payload");
  }
  const sub = decoded.sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new Error("Invalid token subject");
  }
  return { sub, iat: decoded.iat, exp: decoded.exp };
}
