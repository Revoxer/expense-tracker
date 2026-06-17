import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../services/transaction.service";

interface StatsChartProps {
  month: number;
  year: number;
}

export const StatsChart = ({ month, year }: StatsChartProps) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats", month, year],
    queryFn: () => getStats(month, year),
  });

  if (isLoading) return <div>Loading stats...</div>;
  if (!stats || stats.byCategory.length === 0)
    return <div>No data for this period</div>;

  return (
    <div>
      <h2>Total: {stats.totalAmount}</h2>
      <PieChart width={400} height={400}>
        <Pie
          data={stats.byCategory}
          dataKey="total"
          nameKey="categoryName"
          cx="50%"
          cy="50%"
          outerRadius={150}
        >
          {stats.byCategory.map((_, index) => (
            <Cell key={index} fill={`hsl(${index * 45}, 70%, 50%)`} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};
