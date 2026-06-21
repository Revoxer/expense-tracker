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
import { Modal } from "../components/ui/Modal";
import { EditTransactionForm } from "../components/forms/EditTransactionForm";
import type { Transaction } from "../types/transaction.types";

export const DashboardPage = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const now = new Date();
  const [customMonth, setCustomMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const queryClient = useQueryClient();

  const nowMonth = now.getMonth() + 1;
  const nowYear = now.getFullYear();

  const currentMonth = customMonth?.month ?? nowMonth;
  const currentYear = customMonth?.year ?? nowYear;

  const shiftMonth = (month: number, year: number, delta: 1 | -1) => {
    const nextMonth = month + delta;
    if (nextMonth === 0) return { month: 12, year: year - 1 };
    if (nextMonth === 13) return { month: 1, year: year + 1 };
    return { month: nextMonth, year };
  };

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
    queryKey: ["transactions", currentMonth, currentYear],
    queryFn: () => getTransactions({ month: currentMonth, year: currentYear }),
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

  const handlePrevious = () =>
    setCustomMonth(shiftMonth(currentMonth, currentYear, -1));
  const handleNext = () =>
    setCustomMonth(shiftMonth(currentMonth, currentYear, 1));

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
            onClick={handlePrevious}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-3">
            {customMonth && (
              <button
                onClick={() => setCustomMonth(null)}
                className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
              >
                ✕ Reset
              </button>
            )}
            <span className="text-sm font-medium text-gray-900">
              {customMonth
                ? new Date(currentYear, currentMonth - 1).toLocaleDateString(
                    "en-GB",
                    { month: "long", year: "numeric" },
                  )
                : "Current period"}
            </span>
          </div>

          <button
            onClick={handleNext}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors px-3 py-1 rounded-lg hover:bg-gray-100"
          >
            Next →
          </button>
        </div>

        <div className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Spending Overview
          </h2>
          <StatsChart customMonth={customMonth} />
        </div>

        <div className="flex justify-start">
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            + Add Transaction
          </button>
        </div>

        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add Transaction"
        >
          <AddTransactionForm onSuccess={() => setIsAddOpen(false)} />
        </Modal>

        <Modal
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
          title="Edit Transaction"
        >
          {editingTransaction && (
            <EditTransactionForm
              transaction={editingTransaction}
              onSuccess={() => setEditingTransaction(null)}
            />
          )}
        </Modal>

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
                    onClick={() => setEditingTransaction(transaction)}
                    className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
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
