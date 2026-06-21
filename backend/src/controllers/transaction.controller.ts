import { Request, Response, NextFunction } from "express";
import {
  createTransaction,
  findAllTransactions,
  findTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
} from "../services/transaction.service";
import { ValidationError } from "../utils/errors";

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
    const { month, year, categoryId, startDate, endDate } = req.query;
    const userId = req.user!.userId;
    const filters = {
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
      categoryId: typeof categoryId === "string" ? categoryId : undefined,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
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

export const stats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user!.userId;

    if (!startDate || !endDate) {
      throw new ValidationError("startDate and endDate are required");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("startDate and endDate must be valid dates");
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      throw new ValidationError("startDate must be before endDate");
    }

    const result = await getTransactionStats(userId, start, end);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
