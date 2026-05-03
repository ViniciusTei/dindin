import { useMemo } from "react";

import type { DashboardIncomeExpenseMonth } from "~/domain/dashboard/entity";
import { BarChart } from "~/lib/charts";
import { formatDate } from "~/lib/datetime";
import { formatBRL } from "~/lib/money";

export function DashboardIncomeExpenseCard(props: {
  monthIncomeCents: number;
  monthExpenseCents: number;
  incomeExpenseSeries: DashboardIncomeExpenseMonth[];
}) {
  const hasChartData = props.incomeExpenseSeries.some(
    (row) => row.incomeCents > 0 || row.expenseCents > 0,
  );

  const series = useMemo(
    () => [
      {
        name: "Receitas",
        data: props.incomeExpenseSeries.map((row) => ({
          label: formatDate(row.monthLabel, { exclude: ["day"] }),
          value: row.incomeCents,
        })),
        color: "#3b82f6",
      },
      {
        name: "Despesas",
        data: props.incomeExpenseSeries.map((row) => ({
          label: formatDate(row.monthLabel, { exclude: ["day"] }),
          value: row.expenseCents,
        })),
        color: "#ef4444",
      },
    ],
    [props.incomeExpenseSeries],
  );

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Receitas vs despesas</h2>
        {!hasChartData ? (
          <p className="opacity-70">
            Sem dados suficientes para gerar o gráfico.
          </p>
        ) : (
          <div className="h-72 w-full rounded-lg border border-base-300 p-3">
            <BarChart
              series={series}
              formatValue={(v) => formatBRL(v)}
              height={260}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-base-200 p-3">
            <div className="opacity-70">Receitas (mês exibido)</div>
            <div className="font-semibold text-success">
              {formatBRL(props.monthIncomeCents)}
            </div>
          </div>
          <div className="rounded-md bg-base-200 p-3">
            <div className="opacity-70">Despesas (mês exibido)</div>
            <div className="font-semibold text-error">
              {formatBRL(-props.monthExpenseCents)}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
