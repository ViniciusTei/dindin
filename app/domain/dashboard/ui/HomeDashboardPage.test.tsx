import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "~/components/ThemeContext";
import { HomeDashboardPage } from "~/domain/dashboard/ui/HomeDashboardPage";

vi.mock("react-charts", () => {
  return {
    Chart: ({ options }: { options: { data: unknown[]; primaryAxis: { scaleType?: string } } }) => (
      <div data-testid="chart-mock">chart:{options.data.length}</div>
    ),
  };
});

describe("HomeDashboardPage", () => {
  it("renderiza os blocos principais e os gráficos", () => {
    render(
      <ThemeProvider>
        <HomeDashboardPage
          monthLabel="2026-03"
          totalBalanceCents={100_00}
          monthIncomeCents={300_00}
          monthExpenseCents={120_00}
          monthNetCents={180_00}
          expenseByCategory={[
            { categoryName: "Mercado", expenseCents: 70_00 },
            { categoryName: "Transporte", expenseCents: 50_00 },
          ]}
          incomeExpenseSeries={[
            { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 90_00 },
            { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 120_00 },
          ]}
        />
      </ThemeProvider>
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Despesas por categoria")).toBeInTheDocument();
    expect(screen.getByText("Receitas vs despesas")).toBeInTheDocument();
    expect(screen.getAllByTestId("chart-mock")).toHaveLength(2);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
  });

  it("renderiza estado vazio de categorias", () => {
    render(
      <ThemeProvider>
        <HomeDashboardPage
          monthLabel="2026-03"
          totalBalanceCents={0}
          monthIncomeCents={0}
          monthExpenseCents={0}
          monthNetCents={0}
          expenseByCategory={[]}
          incomeExpenseSeries={[{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Nenhuma despesa no mês.")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-mock")).not.toBeInTheDocument();
    expect(screen.getByText("Sem dados suficientes para gerar o gráfico.")).toBeInTheDocument();
  });

  it("não renderiza gráfico de receitas x despesas quando toda série é zero", () => {
    render(
      <ThemeProvider>
        <HomeDashboardPage
          monthLabel="2026-03"
          totalBalanceCents={0}
          monthIncomeCents={0}
          monthExpenseCents={0}
          monthNetCents={0}
          expenseByCategory={[{ categoryName: "Mercado", expenseCents: 10_00 }]}
          incomeExpenseSeries={[{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText("Sem dados suficientes para gerar o gráfico.")).toBeInTheDocument();
    expect(screen.getAllByTestId("chart-mock")).toHaveLength(1);
  });
});
