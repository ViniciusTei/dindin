import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BarSeries = {
  name: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
};

type BarChartProps = {
  series: BarSeries[];
  formatValue?: (v: number) => string;
  formatLabel?: (v: string) => string;
  height?: number;
};

const DEFAULT_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

function buildRechartsData(series: BarSeries[]): Record<string, string | number>[] {
  if (series.length === 0) return [];
  const allLabels = series[0]!.data.map((d) => d.label);
  return allLabels.map((label, i) => {
    const row: Record<string, string | number> = { label };
    series.forEach((s) => {
      row[s.name] = s.data[i]?.value ?? 0;
    });
    return row;
  });
}

export function BarChart({
  series,
  formatValue = String,
  formatLabel = String,
  height = 280,
}: BarChartProps) {
  const data = buildRechartsData(series);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis
          dataKey="label"
          tickFormatter={formatLabel}
          tick={{ fontSize: 11 }}
        />
        <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} width={70} />
        <Tooltip formatter={(value) => formatValue(Number(value))} />
        <Legend />
        {series.map((s, i) => (
          <Bar
            key={s.name}
            dataKey={s.name}
            fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            radius={[3, 3, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
