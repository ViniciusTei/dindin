import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";

import { useTheme } from "~/contexts/ThemeContext";
import type { DashboardIncomeExpenseMonth } from "~/domain/dashboard/entity";
import { formatDate } from "~/lib/datetime";
import { formatBRL } from "~/lib/money";

type IncomeExpenseDatum = {
  month: string;
  value: number;
};

export function DashboardIncomeExpenseCard(props: {
  monthIncomeCents: number;
  monthExpenseCents: number;
  incomeExpenseSeries: DashboardIncomeExpenseMonth[];
}) {
  const { theme } = useTheme();
  const isDark = theme === "sunset";

  const incomeRows = useMemo(
    () =>
      props.incomeExpenseSeries.map((row) => ({
        month: row.monthLabel,
        income: row.incomeCents,
        expense: row.expenseCents,
      })),
    [props.incomeExpenseSeries],
  );

  const hasIncomeExpenseChartData = incomeRows.some(
    (row) => row.income > 0 || row.expense > 0,
  );

  const incomeExpenseData = useMemo(
    () => [
      {
        label: "Receitas",
        data: incomeRows.map((row) => ({
          month: row.month,
          value: row.income,
        })),
      },
      {
        label: "Despesas",
        data: incomeRows.map((row) => ({
          month: row.month,
          value: row.expense,
        })),
      },
    ],
    [incomeRows],
  );

  const incomeExpensePrimaryAxis = useMemo<AxisOptions<IncomeExpenseDatum>>(
    () => ({
      getValue: (datum) => datum.month,
      scaleType: "band",
      innerBandPadding: 0.45,
      outerBandPadding: 0.2,
      innerSeriesBandPadding: 0.3,
      outerSeriesBandPadding: 0.15,
      maxBandSize: 40,
      formatters: {
        scale: (value) => {
          if (typeof value !== "string") {
            return "";
          }

          return formatDate(value, { exclude: ["day"] });
        },
      },
    }),
    [],
  );

  const incomeExpenseSecondaryAxes = useMemo<
    Array<AxisOptions<IncomeExpenseDatum>>
  >(
    () => [
      {
        getValue: (datum) => datum.value,
        scaleType: "linear",
        elementType: "bar",
        formatters: {
          tooltip: (value) => formatBRL(value),
          scale: (value) => formatBRL(value),
        },
      },
    ],
    [],
  );

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Receitas vs despesas</h2>
        {!hasIncomeExpenseChartData ? (
          <p className="opacity-70">
            Sem dados suficientes para gerar o gráfico.
          </p>
        ) : (
          <div className="h-72 w-full rounded-lg border border-base-300 p-3">
            <Chart
              options={{
                data: incomeExpenseData,
                primaryAxis: incomeExpensePrimaryAxis,
                secondaryAxes: incomeExpenseSecondaryAxes,
                interactionMode: "closest",
                initialHeight: 280,
                initialWidth: 520,
                dark: isDark,
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-base-200 p-3">
            <div className="opacity-70">Receitas (mês exibido)</div>
            <div className="font-semibold">
              {formatBRL(props.monthIncomeCents)}
            </div>
          </div>
          <div className="rounded-md bg-base-200 p-3">
            <div className="opacity-70">Despesas (mês exibido)</div>
            <div className="font-semibold">
              {formatBRL(-props.monthExpenseCents)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
