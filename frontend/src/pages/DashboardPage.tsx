import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../services/transaction.service";
import { useAuthStore } from "../stores/auth.store";
import { useNavigate } from "react-router-dom";
import { AddTransactionForm } from "../components/forms/AddTransactionForm";

export const DashboardPage = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions(),
  });

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  if (isLoading) return <div>Loading...</div>;

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
    </div>
  );
};
