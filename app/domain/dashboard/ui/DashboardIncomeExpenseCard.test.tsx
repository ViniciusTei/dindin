import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardIncomeExpenseCard } from "~/domain/dashboard/ui/DashboardIncomeExpenseCard";

vi.mock("~/lib/charts", () => ({
  BarChart: ({ series }: { series: Array<{ name: string }> }) => (
    <div data-testid="bar-chart-mock">
      {series.map((s) => s.name).join(",")}
    </div>
  ),
}));

describe("DashboardIncomeExpenseCard", () => {
  it("renders chart with income and expense series", () => {
    render(
      <DashboardIncomeExpenseCard
        monthIncomeCents={300_00}
        monthExpenseCents={120_00}
        incomeExpenseSeries={[
          { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 90_00 },
          { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 120_00 },
        ]}
      />,
    );

    expect(screen.getByTestId("bar-chart-mock")).toBeInTheDocument();
    expect(screen.getByText(/Receitas.*Despesas/)).toBeInTheDocument();
  });

  it("shows empty state when all series are zero", () => {
    render(
      <DashboardIncomeExpenseCard
        monthIncomeCents={0}
        monthExpenseCents={0}
        incomeExpenseSeries={[
          { monthLabel: "2026-02", incomeCents: 0, expenseCents: 0 },
        ]}
      />,
    );

    expect(screen.getByText(/Sem dados suficientes/)).toBeInTheDocument();
    expect(screen.queryByTestId("bar-chart-mock")).not.toBeInTheDocument();
  });

  it("shows monthly summary amounts with correct colors", () => {
    render(
      <DashboardIncomeExpenseCard
        monthIncomeCents={300_00}
        monthExpenseCents={120_00}
        incomeExpenseSeries={[]}
      />,
    );

    expect(screen.getByText("R$ 300,00")).toBeInTheDocument();
    expect(screen.getByText("-R$ 120,00")).toBeInTheDocument();
  });
});
