import { api } from "./api";
import type {
  Transaction,
  CreateTransactionDto,
  TransactionStats,
} from "../types/transaction.types";

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
  month: number,
  year: number,
): Promise<TransactionStats> => {
  const response = await api.get("/transactions/stats", {
    params: { month, year },
  });
  return response.data;
};
