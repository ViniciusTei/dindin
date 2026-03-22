import { useMemo } from "react";
import { Chart } from "react-charts";
import type { AxisOptions } from "react-charts";

import { useTheme } from "~/components/ThemeContext";
import type { HomeDashboardData } from "~/domain/dashboard/entity";
import { formatBRL } from "~/lib/money";

type ExpenseCategoryDatum = { category: string; value: number };
type IncomeExpenseDatum = { month: string; income: number; expense: number };

export function HomeDashboardPage(props: HomeDashboardData) {
  const { theme } = useTheme();
  const isDark = theme === "sunset";

  const expenseData = useMemo(
    () => [
      {
        label: "Despesas",
        id: "expenses",
        secondaryAxisId: "expense",
        data: props.expenseByCategory.slice(0, 8).map((row) => ({
          category: row.categoryName,
          value: row.expenseCents,
        })),
      },
    ],
    [props.expenseByCategory]
  );

  const expensePrimaryAxis = useMemo<AxisOptions<ExpenseCategoryDatum>>(
    () => ({
      getValue: (datum) => datum.category,
      scaleType: "band",
    }),
    []
  );

  const expenseSecondaryAxes = useMemo<Array<AxisOptions<ExpenseCategoryDatum>>>(
    () => [
      {
        id: "expense",
        getValue: (datum) => datum.value,
        scaleType: "linear",
        elementType: "bar",
      },
    ],
    []
  );

  const incomeExpenseData = useMemo(
    () => [
      {
        label: "Receitas",
        id: "income-series",
        secondaryAxisId: "income",
        data: props.incomeExpenseSeries.map((row) => ({
          month: row.monthLabel,
          income: row.incomeCents,
          expense: row.expenseCents,
        })),
      },
      {
        label: "Despesas",
        id: "expense-series",
        secondaryAxisId: "expense",
        data: props.incomeExpenseSeries.map((row) => ({
          month: row.monthLabel,
          income: row.incomeCents,
          expense: row.expenseCents,
        })),
      },
    ],
    [props.incomeExpenseSeries]
  );

  const incomeExpensePrimaryAxis = useMemo<AxisOptions<IncomeExpenseDatum>>(
    () => ({
      getValue: (datum) => datum.month,
      scaleType: "band",
    }),
    []
  );

  const incomeExpenseSecondaryAxes = useMemo<Array<AxisOptions<IncomeExpenseDatum>>>(
    () => [
      {
        id: "income",
        getValue: (datum) => datum.income,
        elementType: "bar",
      },
      {
        id: "expense",
        getValue: (datum) => datum.expense,
        elementType: "bar",
      },
    ],
    []
  );

  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="text-sm opacity-70">{props.monthLabel}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="card bg-base-100 shadow">
          <div className="card-body gap-2">
            <div className="text-sm opacity-70">Saldo total</div>
            <div className="text-2xl font-semibold">{formatBRL(props.totalBalanceCents)}</div>
            <div className="text-xs opacity-70">Saldo inicial + receitas - despesas</div>
          </div>
        </section>

        <section className="card bg-base-100 shadow">
          <div className="card-body gap-3">
            <div className="text-sm opacity-70">Mês</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <div className="text-xs opacity-70">Receitas</div>
                <div className="font-semibold">{formatBRL(props.monthIncomeCents)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Despesas</div>
                <div className="font-semibold">{formatBRL(-props.monthExpenseCents)}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Resultado</div>
                <div className="font-semibold">{formatBRL(props.monthNetCents)}</div>
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
                    <div key={row.categoryName} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate">{row.categoryName}</span>
                      <span className="font-semibold">{formatBRL(-row.expenseCents)}</span>
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

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-base-200 p-3">
                <div className="opacity-70">Receitas (mês atual)</div>
                <div className="font-semibold">{formatBRL(props.monthIncomeCents)}</div>
              </div>
              <div className="rounded-md bg-base-200 p-3">
                <div className="opacity-70">Despesas (mês atual)</div>
                <div className="font-semibold">{formatBRL(-props.monthExpenseCents)}</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
