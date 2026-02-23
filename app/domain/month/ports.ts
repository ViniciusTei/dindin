export type MonthStatus = "open" | "closed";

export type Month = {
  id: string;
  householdId: string;
  ym: string;
  status: MonthStatus;
};

export type Member = { userId: string; role: string; username: string };
export type IncomeRow = { userId: string; amountCents: number };
export type ExpenseRow = { amountCents: number };

export interface MonthRepo {
  getMonth(params: { monthId: string; householdId: string }): Promise<Month | null>;

  listMembers(params: { householdId: string }): Promise<Member[]>;
  listIncomes(params: { monthId: string; userIds: string[] }): Promise<IncomeRow[]>;
  listExpenses(params: { monthId: string }): Promise<ExpenseRow[]>;

  deleteIncome(params: { monthId: string; userId: string }): Promise<void>;
  upsertIncome(params: {
    idFactory: () => string;
    monthId: string;
    userId: string;
    amountCents: number;
  }): Promise<void>;

  addExpense(params: {
    idFactory: () => string;
    monthId: string;
    categoryId: string;
    description: string;
    amountCents: number;
  }): Promise<void>;

  toggleExpensePaid(params: {
    monthId: string;
    expenseId: string;
    isPaid: boolean;
  }): Promise<void>;

  deleteExpense(params: { monthId: string; expenseId: string }): Promise<void>;

  replaceTransfers(params: {
    idFactory: () => string;
    monthId: string;
    transfers: Array<{ fromUserId: string; toUserId: string; amountCents: number }>;
  }): Promise<void>;

  closeMonth(params: { monthId: string; closedAt: Date }): Promise<void>;
  reopenMonth(params: { monthId: string }): Promise<void>;

  completeTransfer(params: {
    monthId: string;
    transferId: string;
    completedAt: Date | null;
  }): Promise<void>;
}
