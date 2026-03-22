import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";

import { useTheme } from "~/components/ThemeContext";
import type { HomeDashboardData } from "~/domain/dashboard/entity";
import { formatDate } from "~/lib/datetime";
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

type IncomeExpenseDatum = {
  index: number;
  month: string;
  value: number;
};

export function HomeDashboardPage(props: HomeDashboardData) {
  const { theme } = useTheme();
  const isDark = theme === "sunset";
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

  const hasExpenseChartData = expensePie !== null;

  const incomeRows = useMemo(
    () =>
      props.incomeExpenseSeries.map((row, index) => ({
        index,
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
          index: row.index,
          month: row.month,
          value: row.income,
        })),
      },
      {
        label: "Despesas",
        data: incomeRows.map((row) => ({
          index: row.index,
          month: row.month,
          value: row.expense,
        })),
      },
    ],
    [incomeRows],
  );

  const incomeExpensePrimaryAxis = useMemo<AxisOptions<IncomeExpenseDatum>>(
    () => ({
      getValue: (datum) => datum.index,
      scaleType: "linear",
      hardMin: -0.5,
      hardMax: Math.max(incomeRows.length - 0.5, 0.5),
      tickCount: incomeRows.length,
      formatters: {
        scale: (value) => {
          const row = incomeRows[Math.round(value)];
          return row ? formatDate(row.month, { exclude: ["day"] }) : "";
        },
      },
    }),
    [incomeRows],
  );

  const incomeExpenseSecondaryAxes = useMemo<Array<AxisOptions<IncomeExpenseDatum>>>(
    () => [
      {
        getValue: (datum) => datum.value,
        scaleType: "linear",
        elementType: "bar",
      },
    ],
    [],
  );

  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm opacity-70">
            {formatDate(props.monthLabel, { format: "long", exclude: ["day"] })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Saldo total</div>
            <div className="text-2xl font-semibold">
              {formatBRL(props.totalBalanceCents)}
            </div>
            <div className="text-xs opacity-70">
              Saldo inicial + receitas - despesas
            </div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <div className="text-sm opacity-70">Mês</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs opacity-70">Receitas</div>
                <div className="font-semibold">
                  {formatBRL(props.monthIncomeCents)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-70">Despesas</div>
                <div className="font-semibold">
                  {formatBRL(-props.monthExpenseCents)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-70">Resultado</div>
                <div className="font-semibold">
                  {formatBRL(props.monthNetCents)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Despesas por categoria</h2>

            {props.expenseByCategory.length === 0 ? (
              <p className="opacity-70">Nenhuma despesa no mês.</p>
            ) : !hasExpenseChartData ? (
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
                      <span className="text-sm font-semibold">
                        {formatBRL(-expensePie.totalCents)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {expensePie.slices.map((slice) => (
                    <div
                      key={slice.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
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

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <h2 className="card-title">Receitas vs despesas</h2>
            {!hasIncomeExpenseChartData ? (
              <p className="opacity-70">Sem dados suficientes para gerar o gráfico.</p>
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
                <div className="opacity-70">Receitas (mês atual)</div>
                <div className="font-semibold">
                  {formatBRL(props.monthIncomeCents)}
                </div>
              </div>
              <div className="rounded-md bg-base-200 p-3">
                <div className="opacity-70">Despesas (mês atual)</div>
                <div className="font-semibold">
                  {formatBRL(-props.monthExpenseCents)}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
