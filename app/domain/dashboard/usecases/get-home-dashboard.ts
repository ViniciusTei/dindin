import type { HomeDashboardData } from "~/domain/dashboard/entity";
import {
  addMonthsUTC,
  monthLabelUTC,
  monthStartFromLabel,
  monthStartUTC,
  resolveDashboardMonthLabel,
  shiftDashboardMonthLabel,
} from "~/domain/dashboard/month";
import type { DashboardAccountsRepo, DashboardRepo } from "~/domain/dashboard/ports";

export async function getHomeDashboard(params: {
  userId: string;
  householdId: string;
  now?: Date;
  lookbackMonths?: number;
  selectedMonthLabel?: string;
  dashboardRepo: DashboardRepo;
  accountsRepo: DashboardAccountsRepo;
}): Promise<HomeDashboardData> {
  const now = params.now ?? new Date();
  const lookbackMonths = Math.max(1, Math.floor(params.lookbackMonths ?? 6));
  const selectedMonthLabel = resolveDashboardMonthLabel({
    requestedMonthLabel: params.selectedMonthLabel,
    now,
  });
  const selectedMonthStart = monthStartFromLabel(selectedMonthLabel);
  const historyStart = addMonthsUTC(selectedMonthStart, -(lookbackMonths - 1));
  const nextMonthStart = addMonthsUTC(selectedMonthStart, 1);

  const [accounts, monthlyTotals, expenseByCategory, creditCardMonthlyExpenses, creditCardExpenseByCategory] =
    await Promise.all([
    params.accountsRepo.listByUser(params.userId),
    params.dashboardRepo.getMonthlyTotals({
      userId: params.userId,
      start: historyStart,
      end: nextMonthStart,
    }),
    params.dashboardRepo.getExpenseByCategory({
      userId: params.userId,
      householdId: params.householdId,
      start: selectedMonthStart,
      end: nextMonthStart,
    }),
    params.dashboardRepo.getCreditCardMonthlyExpenses({
      userId: params.userId,
      start: historyStart,
      end: nextMonthStart,
      now,
      selectedMonthLabel,
    }),
    params.dashboardRepo.getCreditCardExpenseByCategory({
      userId: params.userId,
      householdId: params.householdId,
      start: selectedMonthStart,
      end: nextMonthStart,
      now,
      selectedMonthLabel,
    }),
  ]);

  const signedSumsById = await params.accountsRepo.sumSignedTransactionsByAccountIds({
    userId: params.userId,
    accountIds: accounts.map((account) => account.id),
  });

  const totalBalanceCents = accounts.reduce(
    (acc, account) => acc + account.initialBalanceCents + (signedSumsById[account.id] ?? 0),
    0
  );

  const expenseByCategoryCombined = new Map<string, number>();
  for (const item of expenseByCategory) {
    expenseByCategoryCombined.set(
      item.categoryName,
      (expenseByCategoryCombined.get(item.categoryName) ?? 0) + item.expenseCents,
    );
  }
  for (const item of creditCardExpenseByCategory) {
    expenseByCategoryCombined.set(
      item.categoryName,
      (expenseByCategoryCombined.get(item.categoryName) ?? 0) + item.expenseCents,
    );
  }

  const normalizedExpenseByCategory = Array.from(expenseByCategoryCombined.entries())
    .map(([categoryName, expenseCents]) => ({
      categoryName,
      expenseCents: Math.max(0, expenseCents),
    }))
    .filter((item) => item.expenseCents > 0)
    .sort((a, b) => b.expenseCents - a.expenseCents);

  const monthlyByLabel = new Map(
    monthlyTotals.map((item) => [
      item.monthLabel,
      {
        incomeCents: item.incomeCents,
        expenseCents: item.expenseCents,
      },
    ])
  );
  for (const item of creditCardMonthlyExpenses) {
    const current = monthlyByLabel.get(item.monthLabel) ?? { incomeCents: 0, expenseCents: 0 };
    monthlyByLabel.set(item.monthLabel, {
      incomeCents: current.incomeCents,
      expenseCents: current.expenseCents + item.expenseCents,
    });
  }

  const incomeExpenseSeries = Array.from({ length: lookbackMonths }, (_, index) => {
    const monthStart = addMonthsUTC(historyStart, index);
    const label = monthLabelUTC(monthStart);
    const monthTotals = monthlyByLabel.get(label) ?? { incomeCents: 0, expenseCents: 0 };

    return {
      monthLabel: label,
      incomeCents: monthTotals.incomeCents,
      expenseCents: monthTotals.expenseCents,
    };
  });

  const thisMonth = monthlyByLabel.get(selectedMonthLabel) ?? { incomeCents: 0, expenseCents: 0 };

  const monthIncomeCents = thisMonth.incomeCents;
  const monthExpenseCents = thisMonth.expenseCents;

  return {
    monthLabel: selectedMonthLabel,
    previousMonthLabel: shiftDashboardMonthLabel(selectedMonthLabel, -1),
    nextMonthLabel: shiftDashboardMonthLabel(selectedMonthLabel, 1),
    totalBalanceCents,
    monthIncomeCents,
    monthExpenseCents,
    monthNetCents: monthIncomeCents - monthExpenseCents,
    expenseByCategory: normalizedExpenseByCategory,
    incomeExpenseSeries,
  };
}
