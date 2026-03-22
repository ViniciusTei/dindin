import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
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
      <MemoryRouter>
        <ThemeProvider>
          <HomeDashboardPage
            monthLabel="2026-03"
            previousMonthLabel="2026-02"
            nextMonthLabel="2026-04"
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
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Despesas por categoria")).toBeInTheDocument();
    expect(screen.getByText("Receitas vs despesas")).toBeInTheDocument();
    expect(screen.getByTestId("expense-pie-chart")).toBeInTheDocument();
    expect(screen.getAllByTestId("chart-mock")).toHaveLength(1);
    expect(screen.getByText("Mercado")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mês anterior" })).toHaveAttribute(
      "href",
      "/?month=2026-02",
    );
    expect(screen.getByRole("link", { name: "Próximo mês" })).toHaveAttribute(
      "href",
      "/?month=2026-04",
    );
  });

  it("renderiza estado vazio de categorias", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <HomeDashboardPage
            monthLabel="2026-03"
            previousMonthLabel="2026-02"
            nextMonthLabel="2026-04"
            totalBalanceCents={0}
            monthIncomeCents={0}
            monthExpenseCents={0}
            monthNetCents={0}
            expenseByCategory={[]}
            incomeExpenseSeries={[{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }]}
          />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Nenhuma despesa no mês.")).toBeInTheDocument();
    expect(screen.queryByTestId("expense-pie-chart")).not.toBeInTheDocument();
    expect(screen.queryByTestId("chart-mock")).not.toBeInTheDocument();
    expect(screen.getByText("Sem dados suficientes para gerar o gráfico.")).toBeInTheDocument();
  });

  it("não renderiza gráfico de receitas x despesas quando toda série é zero", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <HomeDashboardPage
            monthLabel="2026-03"
            previousMonthLabel="2026-02"
            nextMonthLabel="2026-04"
            totalBalanceCents={0}
            monthIncomeCents={0}
            monthExpenseCents={0}
            monthNetCents={0}
            expenseByCategory={[{ categoryName: "Mercado", expenseCents: 10_00 }]}
            incomeExpenseSeries={[{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }]}
          />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Sem dados suficientes para gerar o gráfico.")).toBeInTheDocument();
    expect(screen.queryByTestId("chart-mock")).not.toBeInTheDocument();
    expect(screen.getByTestId("expense-pie-chart")).toBeInTheDocument();
  });

  it("mostra rótulos do mês exibido nas métricas de receita e despesa", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <HomeDashboardPage
            monthLabel="2026-04"
            previousMonthLabel="2026-03"
            nextMonthLabel="2026-05"
            totalBalanceCents={0}
            monthIncomeCents={10_00}
            monthExpenseCents={20_00}
            monthNetCents={-10_00}
            expenseByCategory={[{ categoryName: "Crédito", expenseCents: 20_00 }]}
            incomeExpenseSeries={[{ monthLabel: "2026-04", incomeCents: 10_00, expenseCents: 20_00 }]}
          />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Receitas (mês exibido)")).toBeInTheDocument();
    expect(screen.getByText("Despesas (mês exibido)")).toBeInTheDocument();
    expect(screen.getByText("Saldo atual das contas")).toBeInTheDocument();
  });
});
