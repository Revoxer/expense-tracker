export interface CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
}

export interface UpdateTransactionDto {
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: string;
}

export interface TransactionResponse {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryId: string;
  aiSuggested: boolean;
  createdAt: Date;
  userId: string;
}

export interface TransactionStats {
  totalAmount: number;
  byCategory: { categoryName: string; total: number; percentage: number }[];
  topExpenses: TransactionResponse[];
}
