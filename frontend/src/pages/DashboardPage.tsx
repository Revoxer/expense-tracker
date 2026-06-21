import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  deleteTransaction,
} from "../services/transaction.service";
import { useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { AddTransactionForm } from "../components/forms/AddTransactionForm";
import { StatsChart } from "../components/charts/StatsChart";
import { cardClass } from "../utils/styles";

export const DashboardPage = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
    },
  });

  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transactions", month, year],
    queryFn: () => getTransactions({ month, year }),
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-900 font-medium mb-1">
            Something went wrong
          </p>
          <p className="text-sm text-gray-500">Failed to load transactions</p>
        </div>
      </div>
    );

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Expense Tracker
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear(year - 1);
              } else {
                setMonth(month - 1);
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            ← Previous
          </button>
          <span className="text-sm font-medium text-gray-900">
            {new Date(year, month - 1).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear(year + 1);
              } else {
                setMonth(month + 1);
              }
            }}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Next →
          </button>
        </div>
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Monthly Overview
          </h2>
          <StatsChart month={month} year={year} />
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Add Transaction
          </h2>
          <AddTransactionForm />
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Recent Transactions
          </h2>
          <div className="space-y-3">
            {transactions?.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No transactions yet. Add your first one above!
              </p>
            )}
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(transaction.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-gray-900">
                    ${transaction.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(transaction.id)}
                    disabled={deleteMutation.isPending}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
