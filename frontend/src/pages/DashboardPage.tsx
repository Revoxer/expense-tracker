import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTransactions,
  deleteTransaction,
} from "../services/transaction.service";
import { useState, useMemo } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { AddTransactionForm } from "../components/forms/AddTransactionForm";
import { StatsChart } from "../components/charts/StatsChart";
import { cardClass } from "../utils/styles";
import { Modal } from "../components/ui/Modal";
import { EditTransactionForm } from "../components/forms/EditTransactionForm";
import { getCategories } from "../services/category.service";
import type { Transaction } from "../types/transaction.types";
import { getDateRangeForPeriod, type Period } from "../utils/dateRange";

type SortField = "date" | "amount";
type SortOrder = "asc" | "desc";

export const DashboardPage = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const now = new Date();

  const [customMonth, setCustomMonth] = useState<{
    month: number;
    year: number;
  } | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

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

  const handlePrevious = () => {
    const shifted = shiftMonth(currentMonth, currentYear, -1);
    if (shifted.month === nowMonth && shifted.year === nowYear) {
      setCustomMonth(null);
    } else {
      setCustomMonth(shifted);
    }
  };

  const handleNext = () => {
    const shifted = shiftMonth(currentMonth, currentYear, 1);
    if (shifted.month === nowMonth && shifted.year === nowYear) {
      setCustomMonth(null);
    } else {
      setCustomMonth(shifted);
    }
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

  const { startDate, endDate } = customMonth
    ? { startDate: undefined, endDate: undefined }
    : getDateRangeForPeriod(period);

  const startDateString = startDate?.toLocaleDateString("en-CA");
  const endDateString = endDate?.toLocaleDateString("en-CA");

  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [
      "transactions",
      customMonth ?? period,
      { startDate: startDateString, endDate: endDateString },
    ],
    queryFn: () =>
      getTransactions(
        customMonth
          ? { month: customMonth.month, year: customMonth.year }
          : { startDate: startDateString, endDate: endDateString },
      ),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let result = [...transactions];

    if (categoryFilter) {
      result = result.filter((t) => t.categoryId === categoryFilter);
    }

    result.sort((a, b) => {
      if (sortField === "date") {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortOrder === "asc" ? diff : -diff;
      } else {
        const diff = a.amount - b.amount;
        return sortOrder === "asc" ? diff : -diff;
      }
    });

    return result;
  }, [transactions, sortField, sortOrder, categoryFilter]);

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
                    {
                      month: "long",
                      year: "numeric",
                    },
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
          <StatsChart
            customMonth={customMonth}
            period={period}
            onPeriodChange={setPeriod}
          />
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
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <h2 className="text-base font-semibold text-gray-900">
              Transactions
            </h2>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white"
              >
                <option value="">All categories</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  if (sortField === "date") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortField("date");
                    setSortOrder("desc");
                  }
                }}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                  sortField === "date"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Date{" "}
                {sortField === "date" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
              </button>

              <button
                onClick={() => {
                  if (sortField === "amount") {
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  } else {
                    setSortField("amount");
                    setSortOrder("desc");
                  }
                }}
                className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                  sortField === "amount"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                Amount{" "}
                {sortField === "amount"
                  ? sortOrder === "desc"
                    ? "↓"
                    : "↑"
                  : ""}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                No transactions for this period.
              </p>
            )}
            {filteredTransactions.map((transaction) => (
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
