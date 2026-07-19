import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { badRequest } from "../utils/api-error.js";

export const validate =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw badRequest("Validation failed", result.error.issues);
    }

    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      throw badRequest("Validation failed", result.error.issues);
    }

    // req.query is a getter-only accessor in Express 5, so the validated
    // value is stashed separately instead of reassigning req.query.
    req.validatedQuery = result.data;
    next();
  };
