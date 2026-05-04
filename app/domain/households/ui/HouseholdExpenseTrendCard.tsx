import { useMemo } from "react";

import type { HouseholdExpenseMonth } from "~/domain/households/entity";
import { BarChart } from "~/lib/charts";
import { formatDate } from "~/lib/datetime";
import { formatBRL } from "~/lib/money";

export function HouseholdExpenseTrendCard(props: {
  expenseSeries: HouseholdExpenseMonth[];
  currentMonthExpenseCents: number;
}) {
  const hasChartData = props.expenseSeries.some((row) => row.expenseCents > 0);

  const series = useMemo(
    () => [
      {
        name: "Despesas",
        data: props.expenseSeries.map((row) => ({
          label: formatDate(row.monthLabel, { exclude: ["day"] }),
          value: row.expenseCents,
        })),
        color: "#ef4444",
      },
    ],
    [props.expenseSeries],
  );

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Despesas por mês</h2>

        {!hasChartData ? (
          <p className="opacity-70">Sem dados suficientes para gerar o gráfico.</p>
        ) : (
          <div className="h-72 w-full rounded-lg border border-base-300 p-3">
            <BarChart
              series={series}
              formatValue={(v) => formatBRL(v)}
              height={260}
            />
          </div>
        )}

        <div className="rounded-md bg-base-200 p-3 text-sm">
          <div className="opacity-70">Total de despesas do mês exibido</div>
          <div className="font-semibold text-error">
            {formatBRL(-props.currentMonthExpenseCents)}
          </div>
        </div>
      </div>
    </section>
  );
}
