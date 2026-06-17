import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../services/transaction.service";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { AddTransactionForm } from "../components/forms/AddTransactionForm";
import { StatsChart } from "../components/charts/StatsChart";
import { cardClass } from "../utils/styles";

export const DashboardPage = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const now = new Date();

  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load transactions</div>;

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
        <div className={cardClass}>
          <h2 className="text-base font-semibold text-gray-900 mb-6">
            Monthly Overview
          </h2>
          <StatsChart month={now.getMonth() + 1} year={now.getFullYear()} />
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
                <span className="text-sm font-semibold text-gray-900">
                  ${transaction.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
