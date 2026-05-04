import { useMemo } from "react";

import type { DashboardExpenseByCategory } from "~/domain/dashboard/entity";
import { PieChart } from "~/lib/charts";
import { formatBRL } from "~/lib/money";

const EXPENSE_PIE_COLORS = [
  "#3b82f6",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#f97316",
  "#22c55e",
];

export function DashboardExpensePieCard(props: {
  expenseByCategory: DashboardExpenseByCategory[];
}) {
  const slices = useMemo(() => {
    const rows = props.expenseByCategory.slice(0, 8);
    return rows.map((row, i) => ({
      name: row.categoryName,
      value: row.expenseCents,
      color: EXPENSE_PIE_COLORS[i % EXPENSE_PIE_COLORS.length],
    }));
  }, [props.expenseByCategory]);

  const totalCents = useMemo(
    () => slices.reduce((acc, s) => acc + s.value, 0),
    [slices],
  );

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Despesas por categoria</h2>

        {props.expenseByCategory.length === 0 ? (
          <p className="opacity-70">Nenhuma despesa no mês.</p>
        ) : totalCents <= 0 ? (
          <p className="opacity-70">Sem dados suficientes para gerar o gráfico.</p>
        ) : (
          <div data-testid="expense-pie-chart">
            <PieChart
              slices={slices}
              formatValue={(v) => formatBRL(v)}
              centerLabel="Total"
              centerValue={formatBRL(totalCents)}
              height={260}
            />
          </div>
        )}
      </div>
    </section>
  );
}
