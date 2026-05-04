import type { AvailableMonth } from "~/ui/MonthSelect";
import type { HomeDashboardData } from "~/domain/dashboard/entity";
import { DashboardExpensePieCard } from "~/domain/dashboard/ui/DashboardExpensePieCard";
import { DashboardHouseholdsOverview } from "~/domain/dashboard/ui/DashboardHouseholdsOverview";
import { DashboardIncomeExpenseCard } from "~/domain/dashboard/ui/DashboardIncomeExpenseCard";
import { DashboardMonthHeader } from "~/domain/dashboard/ui/DashboardMonthHeader";
import { DashboardSummaryCards } from "~/domain/dashboard/ui/DashboardSummaryCards";

export function HomeDashboardPage(
  props: HomeDashboardData & { availableMonths?: AvailableMonth[] }
) {
  return (
    <main className="mx-auto mt-10 max-w-5xl px-4">
      <DashboardMonthHeader
        monthLabel={props.monthLabel}
        previousMonthLabel={props.previousMonthLabel}
        nextMonthLabel={props.nextMonthLabel}
        availableMonths={props.availableMonths}
      />

      {/* Zone 1: personal summary */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Resumo pessoal</h2>
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
      </section>

      {/* Zone 2: active households */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-3">Rateios ativos</h2>
        <DashboardHouseholdsOverview
          householdSummaries={props.householdSummaries ?? []}
          monthLabel={props.monthLabel}
        />
      </section>
    </main>
  );
}
