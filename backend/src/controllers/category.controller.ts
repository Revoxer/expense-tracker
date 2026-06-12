import { Request, Response, NextFunction } from "express";
import { findAllCategories } from "../services/category.service";

export const findAll = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await findAllCategories();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
