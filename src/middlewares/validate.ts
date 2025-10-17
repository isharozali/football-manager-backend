import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import httpStatus from "http-status";

type Part = "body" | "query" | "params";

export function validate(part: Part, schema: ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse((req as Record<string, unknown>)[part]);
    if (!parsed.success) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({ message: "Validation error", code: "VALIDATION_ERROR", details: parsed.error.format() });
      return;
    }
    (req as Record<string, unknown>)[part] = parsed.data as unknown;
    next();
  };
}


