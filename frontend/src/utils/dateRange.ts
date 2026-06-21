export type Period = "day" | "week" | "month" | "year";

export const getDateRangeForPeriod = (period: Period) => {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);

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
