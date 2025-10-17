import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import httpStatus from "http-status";
import { Part } from "../types";


export function validate(part: Part, schema: ZodSchema<unknown>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const source = req[part] as unknown;
    const parsed = schema.safeParse(source);
    if (!parsed.success) {
      res
        .status(httpStatus.BAD_REQUEST)
        .json({
          message: "Validation error",
          code: "VALIDATION_ERROR",
          details: parsed.error.format(),
        });
      return;
    }
    req[part] = parsed.data as unknown;
    next();
  };
}
