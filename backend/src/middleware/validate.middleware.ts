import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod/v3";

export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: "Validation failed",
        details: result.error.errors,
      });
      return;
    }

    next();
  };
};
