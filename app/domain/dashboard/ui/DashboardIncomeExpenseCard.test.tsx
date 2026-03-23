import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "~/contexts/ThemeContext";
import { DashboardIncomeExpenseCard } from "~/domain/dashboard/ui/DashboardIncomeExpenseCard";

const chartSpy = vi.fn();

vi.mock("react-charts", () => {
  return {
    Chart: ({
      options,
    }: {
      options: {
        primaryAxis: {
          scaleType?: string;
          innerBandPadding?: number;
          innerSeriesBandPadding?: number;
          maxBandSize?: number;
        };
      };
    }) => {
      chartSpy(options);
      return <div data-testid="chart-mock">chart</div>;
    },
  };
});

describe("DashboardIncomeExpenseCard", () => {
  it("configura barras mais finas com agrupamento por mês", () => {
    chartSpy.mockClear();

    render(
      <ThemeProvider>
        <DashboardIncomeExpenseCard
          monthIncomeCents={300_00}
          monthExpenseCents={120_00}
          incomeExpenseSeries={[
            { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 90_00 },
            { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 120_00 },
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("chart-mock")).toBeInTheDocument();
    expect(chartSpy).toHaveBeenCalledTimes(1);

    const options = chartSpy.mock.calls[0][0] as {
      primaryAxis: {
        scaleType?: string;
        innerBandPadding?: number;
        innerSeriesBandPadding?: number;
        maxBandSize?: number;
      };
    };

    expect(options.primaryAxis.scaleType).toBe("band");
    expect(options.primaryAxis.innerBandPadding).toBe(0.45);
    expect(options.primaryAxis.innerSeriesBandPadding).toBe(0.3);
    expect(options.primaryAxis.maxBandSize).toBe(40);
  });
});
