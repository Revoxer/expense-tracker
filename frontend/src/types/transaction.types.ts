export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  aiSuggested: boolean;
  createdAt: string;
  userId: string;
}

export interface CreateTransactionDto {
  amount: number;
  description: string;
  date: string;
  categoryId?: string;
}

export interface TransactionStats {
  totalAmount: number;
  byCategory: {
    categoryName: string;
    total: number;
    percentage: number;
  }[];
  topExpenses: Transaction[];
}
