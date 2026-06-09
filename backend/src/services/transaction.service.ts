import {
  CreateTransactionDto,
  TransactionResponse,
} from "../types/transaction.types";
import { categorizeTransaction } from "./ai.service";
import { PrismaClient, Prisma } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "../config/env";

const adapter = new PrismaPg({
  connectionString: config.databaseUrl,
});

const prisma = new PrismaClient({ adapter });

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
    categoryId = category!.id;
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
  filters: { month?: number; year?: number; categoryId?: string },
): Promise<TransactionResponse[]> => {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.month && filters.year) {
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
