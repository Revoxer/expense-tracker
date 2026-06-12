import { Request, Response, NextFunction } from "express";
import {
  findAllCategories,
  findCategoryById,
} from "../services/category.service";

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

export const findById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const result = await findCategoryById(id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
