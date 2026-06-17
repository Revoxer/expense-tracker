import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../services/transaction.service";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { AddTransactionForm } from "../components/forms/AddTransactionForm";
import { StatsChart } from "../components/charts/StatsChart";

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
    <div>
      <button onClick={handleLogout}>Logout</button>
      {transactions?.map((transaction) => (
        <div key={transaction.id}>
          <span>{transaction.description}</span>
          <span>{transaction.amount}</span>
          <span>{transaction.date}</span>
        </div>
      ))}
      <AddTransactionForm />
      <StatsChart month={now.getMonth() + 1} year={now.getFullYear()} />
    </div>
  );
};
