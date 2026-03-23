import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";

import { useTheme } from "~/contexts/ThemeContext";
import type { HouseholdExpenseMonth } from "~/domain/households/entity";
import { formatDate } from "~/lib/datetime";
import { formatBRL } from "~/lib/money";

type ExpenseDatum = {
  month: string;
  expenseCents: number;
};

export function HouseholdExpenseTrendCard(props: {
  expenseSeries: HouseholdExpenseMonth[];
  currentMonthExpenseCents: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "sunset";

  const rows = useMemo(
    () => props.expenseSeries.map((row) => ({ month: row.monthLabel, expenseCents: row.expenseCents })),
    [props.expenseSeries]
  );

  const hasChartData = rows.some((row) => row.expenseCents > 0);

  const data = useMemo(
    () => [
      {
        label: "Despesas",
        data: rows,
      },
    ],
    [rows]
  );

  const primaryAxis = useMemo<AxisOptions<ExpenseDatum>>(
    () => ({
      getValue: (datum) => datum.month,
      scaleType: "band",
      formatters: {
        scale: (value) => (typeof value === "string" ? formatDate(value, { exclude: ["day"] }) : ""),
      },
    }),
    []
  );

  const secondaryAxes = useMemo<Array<AxisOptions<ExpenseDatum>>>(
    () => [
      {
        getValue: (datum) => datum.expenseCents,
        scaleType: "linear",
        elementType: "bar",
        formatters: {
          tooltip: (value) => formatBRL(-value),
          scale: (value) => formatBRL(-value),
        },
      },
    ],
    []
  );

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Despesas por mês</h2>

        {!hasChartData ? (
          <p className="opacity-70">Sem dados suficientes para gerar o gráfico.</p>
        ) : (
          <div className="h-72 w-full rounded-lg border border-base-300 p-3">
            <Chart
              options={{
                data,
                primaryAxis,
                secondaryAxes,
                interactionMode: "closest",
                initialHeight: 280,
                initialWidth: 520,
                dark: isDark,
              }}
            />
          </div>
        )}

        <div className="rounded-md bg-base-200 p-3 text-sm">
          <div className="opacity-70">Total de despesas do mês exibido</div>
          <div className="font-semibold">{formatBRL(-props.currentMonthExpenseCents)}</div>
        </div>
      </div>
    </section>
  );
}
