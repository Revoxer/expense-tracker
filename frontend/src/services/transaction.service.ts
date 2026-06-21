import { api } from "./api";
import type {
  Transaction,
  CreateTransactionDto,
  TransactionStats,
} from "../types/transaction.types";

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-CA");
};

export const getTransactions = async (filters?: {
  month?: number;
  year?: number;
  categoryId?: string;
}): Promise<Transaction[]> => {
  const response = await api.get("/transactions", { params: filters });
  return response.data;
};

export const createTransaction = async (
  data: CreateTransactionDto,
): Promise<Transaction> => {
  const response = await api.post("/transactions", data);
  return response.data;
};

export const updateTransaction = async (
  id: string,
  data: Partial<CreateTransactionDto>,
): Promise<Transaction> => {
  const response = await api.patch(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  await api.delete(`/transactions/${id}`);
};

export const getStats = async (
  startDate: Date,
  endDate: Date,
): Promise<TransactionStats> => {
  const response = await api.get("/transactions/stats", {
    params: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  });
  return response.data;
};
