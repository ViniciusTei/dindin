export type DashboardExpenseByCategory = {
  categoryName: string;
  expenseCents: number;
};

export type DashboardIncomeExpenseMonth = {
  monthLabel: string;
  incomeCents: number;
  expenseCents: number;
};

export type HomeDashboardData = {
  monthLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  totalBalanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthNetCents: number;
  expenseByCategory: DashboardExpenseByCategory[];
  incomeExpenseSeries: DashboardIncomeExpenseMonth[];
};
