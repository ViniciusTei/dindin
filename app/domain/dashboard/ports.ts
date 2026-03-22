import type { Account } from "~/domain/accounts/entity";

export interface DashboardAccountsRepo {
  listByUser(userId: string): Promise<Account[]>;

  sumSignedTransactionsByAccountIds(params: {
    userId: string;
    accountIds: string[];
  }): Promise<Record<string, number>>;
}

export interface DashboardRepo {
  getMonthlyTotals(params: {
    userId: string;
    start: Date;
    end: Date;
  }): Promise<Array<{ monthLabel: string; incomeCents: number; expenseCents: number }>>;

  getExpenseByCategory(params: {
    userId: string;
    householdId: string;
    start: Date;
    end: Date;
  }): Promise<Array<{ categoryName: string; expenseCents: number }>>;

  getCreditCardMonthlyExpenses(params: {
    userId: string;
    start: Date;
    end: Date;
    now?: Date;
  }): Promise<Array<{ monthLabel: string; expenseCents: number }>>;

  getCreditCardExpenseByCategory(params: {
    userId: string;
    householdId: string;
    start: Date;
    end: Date;
    now?: Date;
  }): Promise<Array<{ categoryName: string; expenseCents: number }>>;
}
