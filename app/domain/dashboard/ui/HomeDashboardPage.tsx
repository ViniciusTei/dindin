import type { HomeDashboardData } from "~/domain/dashboard/entity";
import { DashboardExpensePieCard } from "~/domain/dashboard/ui/DashboardExpensePieCard";
import { DashboardHouseholdsOverview } from "~/domain/dashboard/ui/DashboardHouseholdsOverview";
import { DashboardIncomeExpenseCard } from "~/domain/dashboard/ui/DashboardIncomeExpenseCard";
import { DashboardMonthHeader } from "~/domain/dashboard/ui/DashboardMonthHeader";
import { DashboardSummaryCards } from "~/domain/dashboard/ui/DashboardSummaryCards";

export function HomeDashboardPage(props: HomeDashboardData) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <DashboardMonthHeader
        monthLabel={props.monthLabel}
        previousMonthLabel={props.previousMonthLabel}
        nextMonthLabel={props.nextMonthLabel}
      />

      <DashboardSummaryCards
        totalBalanceCents={props.totalBalanceCents}
        monthIncomeCents={props.monthIncomeCents}
        monthExpenseCents={props.monthExpenseCents}
        monthNetCents={props.monthNetCents}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <DashboardExpensePieCard expenseByCategory={props.expenseByCategory} />
        <DashboardIncomeExpenseCard
          monthIncomeCents={props.monthIncomeCents}
          monthExpenseCents={props.monthExpenseCents}
          incomeExpenseSeries={props.incomeExpenseSeries}
        />
      </div>

      <DashboardHouseholdsOverview
        householdSummaries={props.householdSummaries ?? []}
        monthLabel={props.monthLabel}
      />
    </main>
  );
}
