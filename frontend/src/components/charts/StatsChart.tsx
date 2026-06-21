import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { getStats } from "../../services/transaction.service";
import { getChartColor, clampPercentage } from "../../utils/chartColors";
import { useState, useMemo } from "react";

interface StatsChartProps {
  customMonth: { month: number; year: number } | null;
  period: "day" | "week" | "month" | "year";
  onPeriodChange: (period: "day" | "week" | "month" | "year") => void;
}

export const StatsChart = ({
  customMonth,
  period,
  onPeriodChange,
}: StatsChartProps) => {
  const [sortAsc, setSortAsc] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    if (customMonth) {
      return {
        startDate: new Date(customMonth.year, customMonth.month - 1, 1),
        endDate: new Date(
          customMonth.year,
          customMonth.month,
          0,
          23,
          59,
          59,
          999,
        ),
      };
    }

    switch (period) {
      case "day":
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          endDate: end,
        };
      case "week": {
        const start = new Date(now);
        const day = now.getDay();
        start.setDate(now.getDate() - day);
        start.setHours(0, 0, 0, 0);
        return { startDate: start, endDate: end };
      }
      case "month":
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: end,
        };
      case "year":
        return {
          startDate: new Date(now.getFullYear(), 0, 1),
          endDate: end,
        };
    }
  };

  const { startDate, endDate } = getDateRange();

  const {
    data: stats,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [
      "stats",
      customMonth ?? period,
      startDate.toDateString(),
      endDate.toDateString(),
    ],
    queryFn: () => getStats(startDate, endDate),
  });

  const categories = useMemo(
    () =>
      (stats?.byCategory ?? []).map((cat, index) => ({
        ...cat,
        color: getChartColor(index),
      })),
    [stats],
  );

  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        sortAsc ? a.total - b.total : b.total - a.total,
      ),
    [categories, sortAsc],
  );

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
      {!customMonth && (
        <div className="flex gap-2 mb-6">
          {(["day", "week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {p === "day"
                ? "Today"
                : p === "week"
                  ? "This Week"
                  : p === "month"
                    ? "This Month"
                    : "This Year"}
            </button>
          ))}
        </div>
      )}

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
            data={categories}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            outerRadius={120}
            innerRadius={60}
          >
            {categories.map((cat) => (
              <Cell key={cat.categoryName} fill={cat.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
          />
        </PieChart>

        <div className="flex-1 w-full">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Categories
            </span>
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              {sortAsc ? "↑ Lowest first" : "↓ Highest first"}
            </button>
          </div>

          <div className="space-y-3">
            {sortedCategories.map((cat) => {
              const pct = clampPercentage(cat.percentage);
              const width = `${pct}%`;

              return (
                <div key={cat.categoryName} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
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
    </div>
  );
};
