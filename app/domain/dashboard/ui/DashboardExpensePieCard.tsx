import { useMemo } from "react";

import type { DashboardExpenseByCategory } from "~/domain/dashboard/entity";
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

type ExpensePieSlice = {
  id: string;
  category: string;
  value: number;
  percentage: number;
  color: string;
  startDeg: number;
  endDeg: number;
};

export function DashboardExpensePieCard(props: {
  expenseByCategory: DashboardExpenseByCategory[];
}) {
  const percentageFormatter = useMemo(
    () =>
      new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [],
  );

  const expensePie = useMemo(() => {
    const rows = props.expenseByCategory.slice(0, 8).map((row, index) => ({
      id: `${index}-${row.categoryName}`,
      category: row.categoryName,
      value: row.expenseCents,
    }));
    const totalCents = rows.reduce((acc, row) => acc + row.value, 0);
    if (totalCents <= 0) return null;

    let currentDeg = 0;
    const slices: ExpensePieSlice[] = rows.map((row, index) => {
      const startDeg = currentDeg;
      const angle = (row.value / totalCents) * 360;
      currentDeg += angle;

      return {
        ...row,
        percentage: (row.value / totalCents) * 100,
        color: EXPENSE_PIE_COLORS[index % EXPENSE_PIE_COLORS.length]!,
        startDeg,
        endDeg: index === rows.length - 1 ? 360 : currentDeg,
      };
    });

    const gradient = `conic-gradient(${slices
      .map(
        (slice) =>
          `${slice.color} ${slice.startDeg.toFixed(4)}deg ${slice.endDeg.toFixed(4)}deg`,
      )
      .join(", ")})`;

    return {
      slices,
      totalCents,
      gradient,
    };
  }, [props.expenseByCategory]);

  return (
    <section className="card bg-base-100 shadow">
      <div className="card-body gap-4">
        <h2 className="card-title">Despesas por categoria</h2>

        {props.expenseByCategory.length === 0 ? (
          <p className="opacity-70">Nenhuma despesa no mês.</p>
        ) : expensePie === null ? (
          <p className="opacity-70">Sem dados suficientes para gerar o gráfico.</p>
        ) : (
          <div>
            <div className="flex justify-center">
              <div
                data-testid="expense-pie-chart"
                aria-label="Gráfico de pizza de despesas por categoria"
                className="relative h-64 w-64 rounded-full border border-base-300"
                style={{ backgroundImage: expensePie.gradient }}
              >
                <div className="absolute inset-[24%] flex flex-col items-center justify-center rounded-full bg-base-100 text-center">
                  <span className="text-xs opacity-70">Total de despesas</span>
                  <span className="text-sm font-semibold">{formatBRL(-expensePie.totalCents)}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {expensePie.slices.map((slice) => (
                <div key={slice.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="truncate">{slice.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatBRL(-slice.value)}</div>
                    <div className="text-xs opacity-70">
                      {percentageFormatter.format(slice.percentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
