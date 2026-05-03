import {
  Cell,
  Legend,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type PieSlice = {
  name: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  slices: PieSlice[];
  formatValue?: (v: number) => string;
  centerLabel?: string;
  centerValue?: string;
  height?: number;
};

const DEFAULT_COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#f97316",
  "#22c55e",
];

export function PieChart({
  slices,
  formatValue = String,
  centerLabel,
  centerValue,
  height = 260,
}: PieChartProps) {
  const data = slices.map((s) => ({ name: s.name, value: s.value }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="75%"
          paddingAngle={2}
          label={false}
        >
          {slices.map((slice, i) => (
            <Cell
              key={slice.name}
              fill={slice.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatValue(Number(value))} />
        <Legend />
        {centerLabel && centerValue ? (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 12, opacity: 0.7 }}
          >
            {centerLabel}
            <tspan x="50%" dy="1.2em" style={{ fontWeight: 600, fontSize: 13 }}>
              {centerValue}
            </tspan>
          </text>
        ) : null}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
