export const CHART_COLORS = [
  "hsl(0, 60%, 55%)",
  "hsl(45, 60%, 55%)",
  "hsl(90, 60%, 55%)",
  "hsl(135, 60%, 55%)",
  "hsl(180, 60%, 55%)",
  "hsl(225, 60%, 55%)",
  "hsl(270, 60%, 55%)",
  "hsl(315, 60%, 55%)",
];

export const getChartColor = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const clampPercentage = (value: number): number => {
  const pct = Number.isFinite(value) ? value : 0;
  return Math.min(100, Math.max(0, pct));
};
