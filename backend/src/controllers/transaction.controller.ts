import { Request, Response, NextFunction } from "express";
import {
  createTransaction,
  findAllTransactions,
  findTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../services/transaction.service";

export const create = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;
    const userId = req.user!.userId;
    const result = await createTransaction(userId, data);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const findAll = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { month, year, categoryId } = req.query;
    const userId = req.user!.userId;
    const filters = {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      categoryId: typeof categoryId === "string" ? categoryId : undefined,
    };
    const result = await findAllTransactions(userId, filters);
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
    const userId = req.user!.userId;
    const result = await findTransactionById(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const result = await updateTransaction(userId, id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id as string;
    const userId = req.user!.userId;
    const result = await deleteTransaction(userId, id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
