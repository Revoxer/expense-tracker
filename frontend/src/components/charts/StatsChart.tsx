import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../services/transaction.service";
import { getChartColor, clampPercentage } from "../../utils/chartColors";

interface StatsChartProps {
  month: number;
  year: number;
}

export const StatsChart = ({ month, year }: StatsChartProps) => {
  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["stats", month, year],
    queryFn: () => getStats(month, year),
  });

  if (isLoading) return <div>Loading stats...</div>;
  if (isError) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return <div>Error loading stats: {message}</div>;
  }
  if (!stats || stats.byCategory.length === 0)
    return <div>No data for this period</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500">Total spent</p>
          <p className="text-3xl font-semibold text-gray-900">
            ${stats.totalAmount.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        <PieChart width={280} height={280}>
          <Pie
            data={stats.byCategory}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
          >
            {stats.byCategory.map((_, index) => (
              <Cell key={index} fill={getChartColor(index)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
          />
        </PieChart>

        <div className="flex-1 w-full space-y-3">
          {stats.byCategory.map((cat, index) => {
            const pct = clampPercentage(cat.percentage);
            const width = `${pct}%`;

            return (
              <div key={cat.categoryName} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: getChartColor(index) }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {cat.categoryName}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-gray-900 h-1.5 rounded-full"
                        style={{ width }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10 text-right">
                      {pct}%
                    </span>
                    <span className="text-sm text-gray-500 w-16 text-right">
                      ${cat.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
