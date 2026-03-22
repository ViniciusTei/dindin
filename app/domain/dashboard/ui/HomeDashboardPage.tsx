import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";

import { useTheme } from "~/components/ThemeContext";
import type { HomeDashboardData } from "~/domain/dashboard/entity";
import { formatDate } from "~/lib/datetime";
import { formatBRL } from "~/lib/money";

type ExpenseCategoryDatum = {
  index: number;
  category: string;
  value: number;
};

type IncomeExpenseDatum = {
  index: number;
  month: string;
  value: number;
};

export function HomeDashboardPage(props: HomeDashboardData) {
  const { theme } = useTheme();
  const isDark = theme === "sunset";

  const expenseRows = useMemo(
    () =>
      props.expenseByCategory.slice(0, 8).map((row, index) => ({
        index,
        category: row.categoryName,
        value: row.expenseCents,
      })),
    [props.expenseByCategory],
  );

  const hasExpenseChartData = expenseRows.length > 0;

  const expenseData = useMemo(
    () => [
      {
        label: "Despesas",
        data: expenseRows,
      },
    ],
    [expenseRows],
  );

  const expensePrimaryAxis = useMemo<AxisOptions<ExpenseCategoryDatum>>(
    () => ({
      getValue: (datum) => datum.index,
      scaleType: "linear",
      hardMin: -0.5,
      hardMax: Math.max(expenseRows.length - 0.5, 0.5),
      tickCount: expenseRows.length,
      formatters: {
        scale: (value) => {
          const row = expenseRows[Math.round(value)];
          return row?.category ?? "";
        },
      },
    }),
    [expenseRows],
  );

  const expenseSecondaryAxes = useMemo<Array<AxisOptions<ExpenseCategoryDatum>>>(
    () => [
      {
        getValue: (datum) => datum.value,
        scaleType: "linear",
        elementType: "bar",
      },
    ],
    [],
  );

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
                <div className="h-72 w-full rounded-lg border border-base-300 p-3">
                  <Chart
                    options={{
                      data: expenseData,
                      primaryAxis: expensePrimaryAxis,
                      secondaryAxes: expenseSecondaryAxes,
                      interactionMode: "closest",
                      initialHeight: 280,
                      initialWidth: 520,
                      dark: isDark,
                      tooltip: false,
                    }}
                  />
                </div>
                <div className="mt-3 space-y-2">
                  {props.expenseByCategory.slice(0, 8).map((row) => (
                    <div
                      key={row.categoryName}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate">{row.categoryName}</span>
                      <span className="font-semibold">
                        {formatBRL(-row.expenseCents)}
                      </span>
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
