import {
  CreateTransactionDto,
  TransactionResponse,
  UpdateTransactionDto,
  TransactionStats,
} from "../types/transaction.types";
import { categorizeTransaction } from "./ai.service";
import { Prisma } from "../generated/prisma/client";
import { prisma } from "../db/prisma";
import { NotFoundError } from "../utils/errors";

export const createTransaction = async (
  userId: string,
  data: CreateTransactionDto,
): Promise<TransactionResponse> => {
  let categoryId = data.categoryId;
  let aiSuggested = false;

  if (!categoryId) {
    const categoryName = await categorizeTransaction(data.description);

    const category =
      (await prisma.category.findFirst({
        where: { name: categoryName },
      })) ??
      (await prisma.category.findFirst({
        where: { name: "Other" },
      }));
    if (!category) {
      throw new NotFoundError(
        "No categories found in database. Run seed first.",
      );
    }
    categoryId = category.id;
    aiSuggested = true;
  }

  const transaction = await prisma.transaction.create({
    data: {
      amount: data.amount,
      description: data.description,
      date: new Date(data.date),
      categoryId,
      userId,
      aiSuggested,
    },
  });

  return {
    ...transaction,
    amount: Number(transaction.amount),
  };
};

export const findAllTransactions = async (
  userId: string,
  filters: {
    month?: number;
    year?: number;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
  },
): Promise<TransactionResponse[]> => {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.startDate && filters.endDate) {
    where.date = { gte: filters.startDate, lte: filters.endDate };
  } else if (filters.month && filters.year) {
    const startDate = new Date(filters.year, filters.month - 1, 1);
    const endDate = new Date(filters.year, filters.month, 0);
    where.date = { gte: startDate, lte: endDate };
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return transactions.map((t) => ({
    ...t,
    amount: Number(t.amount),
  }));
};

export const findTransactionById = async (
  userId: string,
  transactionId: string,
): Promise<TransactionResponse> => {
  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!transaction) {
    throw new NotFoundError("Transaction not found");
  }

  return {
    ...transaction,
    amount: Number(transaction.amount),
  };
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: UpdateTransactionDto,
): Promise<TransactionResponse> => {
  await findTransactionById(userId, transactionId);

  const { amount, description, date, categoryId } = data;

  const updateData: Prisma.TransactionUpdateInput = {
    amount,
    description,
    date: date ? new Date(date) : undefined,
    ...(categoryId && {
      category: { connect: { id: categoryId } },
    }),
  };

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
  });

  return {
    ...updated,
    amount: Number(updated.amount),
  };
};

export const deleteTransaction = async (
  userId: string,
  transactionId: string,
): Promise<{ message: string }> => {
  await findTransactionById(userId, transactionId);

  await prisma.transaction.delete({
    where: { id: transactionId },
  });

  return { message: "Transaction deleted successfully" };
};

export const getTransactionStats = async (
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<TransactionStats> => {
  const transactions = await findAllTransactions(userId, {
    startDate,
    endDate,
  });

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  const grouped = transactions.reduce(
    (acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topExpenses = [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const categories = await prisma.category.findMany({
    where: { id: { in: Object.keys(grouped) } },
  });

  const byCategory = categories.map((cat) => ({
    categoryName: cat.name,
    total: grouped[cat.id] || 0,
    percentage:
      totalAmount > 0 ? Math.round((grouped[cat.id] / totalAmount) * 100) : 0,
  }));

  return {
    totalAmount,
    byCategory,
    topExpenses,
  };
};
