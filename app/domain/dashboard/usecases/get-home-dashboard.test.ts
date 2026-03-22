import { describe, expect, it } from "vitest";

import { getHomeDashboard } from "~/domain/dashboard/usecases/get-home-dashboard";

function makeDashboardRepo(seed?: {
  monthlyTotals?: Array<{ monthLabel: string; incomeCents: number; expenseCents: number }>;
  expenseByCategory?: Array<{ categoryName: string; expenseCents: number }>;
  creditCardMonthlyExpenses?: Array<{ monthLabel: string; expenseCents: number }>;
  creditCardExpenseByCategory?: Array<{ categoryName: string; expenseCents: number }>;
}) {
  const monthlyTotals = [...(seed?.monthlyTotals ?? [])];
  const expenseByCategory = [...(seed?.expenseByCategory ?? [])];
  const creditCardMonthlyExpenses = [...(seed?.creditCardMonthlyExpenses ?? [])];
  const creditCardExpenseByCategory = [...(seed?.creditCardExpenseByCategory ?? [])];

  return {
    repo: {
      async getMonthlyTotals() {
        return monthlyTotals;
      },
      async getExpenseByCategory() {
        return expenseByCategory;
      },
      async getCreditCardMonthlyExpenses() {
        return creditCardMonthlyExpenses;
      },
      async getCreditCardExpenseByCategory() {
        return creditCardExpenseByCategory;
      },
    },
  };
}

function makeDashboardAccountsRepo(seed?: {
  accounts?: Array<{ id: string; initialBalanceCents: number }>;
  signedSumsByAccountId?: Record<string, number>;
}) {
  const accounts = (seed?.accounts ?? []).map((account) => ({
    id: account.id,
    userId: "user-1",
    name: `Conta ${account.id}`,
    initialBalanceCents: account.initialBalanceCents,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
  }));

  const signedSumsByAccountId = { ...(seed?.signedSumsByAccountId ?? {}) };

  return {
    repo: {
      async listByUser() {
        return accounts;
      },
      async sumSignedTransactionsByAccountIds(params: { accountIds: string[] }) {
        const out: Record<string, number> = {};
        for (const accountId of params.accountIds) {
          if (signedSumsByAccountId[accountId] != null) out[accountId] = signedSumsByAccountId[accountId]!;
        }
        return out;
      },
    },
  };
}

describe("domain/dashboard/getHomeDashboard", () => {
  it("monta totais do mês atual e saldo total considerando contas e somas assinadas", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [
        {
          monthLabel: "2026-03",
          incomeCents: 500_00,
          expenseCents: 120_00,
        },
      ],
      expenseByCategory: [
        { categoryName: "Mercado", expenseCents: 70_00 },
        { categoryName: "Transporte", expenseCents: 50_00 },
      ],
    });

    const { repo: accountsRepo } = makeDashboardAccountsRepo({
      accounts: [
        { id: "a1", initialBalanceCents: 100_00 },
        { id: "a2", initialBalanceCents: 200_00 },
      ],
      signedSumsByAccountId: {
        a1: 30_00,
        a2: -20_00,
      },
    });

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-22T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 1,
    });

    expect(result.monthLabel).toBe("2026-03");
    expect(result.totalBalanceCents).toBe(310_00);
    expect(result.monthIncomeCents).toBe(500_00);
    expect(result.monthExpenseCents).toBe(120_00);
    expect(result.monthNetCents).toBe(380_00);
    expect(result.expenseByCategory).toEqual([
      { categoryName: "Mercado", expenseCents: 70_00 },
      { categoryName: "Transporte", expenseCents: 50_00 },
    ]);
  });

  it("normaliza despesas por categoria removendo valores não positivos", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [
        {
          monthLabel: "2026-03",
          incomeCents: 0,
          expenseCents: 0,
        },
      ],
      expenseByCategory: [
        { categoryName: "Sem movimento", expenseCents: 0 },
        { categoryName: "Ajuste", expenseCents: -10_00 },
        { categoryName: "Mercado", expenseCents: 20_00 },
      ],
    });

    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-22T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 1,
    });

    expect(result.expenseByCategory).toEqual([{ categoryName: "Mercado", expenseCents: 20_00 }]);
  });

  it("limita série histórica ao lookback configurado e ordena por mês crescente", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [
        {
          monthLabel: "2026-01",
          incomeCents: 100_00,
          expenseCents: 30_00,
        },
        {
          monthLabel: "2026-02",
          incomeCents: 200_00,
          expenseCents: 90_00,
        },
        {
          monthLabel: "2026-03",
          incomeCents: 300_00,
          expenseCents: 70_00,
        },
      ],
    });

    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-22T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 3,
    });

    expect(result.incomeExpenseSeries).toEqual([
      { monthLabel: "2026-01", incomeCents: 100_00, expenseCents: 30_00 },
      { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 90_00 },
      { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 70_00 },
    ]);
  });

  it("força lookback mínimo de 1 mês", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [
        {
          monthLabel: "2026-03",
          incomeCents: 10_00,
          expenseCents: 5_00,
        },
      ],
    });
    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-22T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 0,
    });

    expect(result.incomeExpenseSeries).toHaveLength(1);
    expect(result.incomeExpenseSeries[0]?.monthLabel).toBe("2026-03");
  });

  it("inclui despesas de cartão de crédito no resumo mensal, série e categorias", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [
        { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 40_00 },
        { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 70_00 },
      ],
      expenseByCategory: [
        { categoryName: "Mercado", expenseCents: 50_00 },
        { categoryName: "Transporte", expenseCents: 10_00 },
      ],
      creditCardMonthlyExpenses: [
        { monthLabel: "2026-02", expenseCents: 20_00 },
        { monthLabel: "2026-03", expenseCents: 30_00 },
      ],
      creditCardExpenseByCategory: [
        { categoryName: "Mercado", expenseCents: 30_00 },
        { categoryName: "Cartão online", expenseCents: 40_00 },
      ],
    });
    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-10T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 2,
    });

    expect(result.monthExpenseCents).toBe(100_00);
    expect(result.monthNetCents).toBe(200_00);
    expect(result.incomeExpenseSeries).toEqual([
      { monthLabel: "2026-02", incomeCents: 200_00, expenseCents: 60_00 },
      { monthLabel: "2026-03", incomeCents: 300_00, expenseCents: 100_00 },
    ]);
    expect(result.expenseByCategory).toEqual([
      { categoryName: "Mercado", expenseCents: 80_00 },
      { categoryName: "Cartão online", expenseCents: 40_00 },
      { categoryName: "Transporte", expenseCents: 10_00 },
    ]);
  });

  it("combina despesas sem categoria de cartão no gráfico de pizza", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }],
      expenseByCategory: [],
      creditCardMonthlyExpenses: [{ monthLabel: "2026-03", expenseCents: 90_00 }],
      creditCardExpenseByCategory: [{ categoryName: "Crédito", expenseCents: 90_00 }],
    });
    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-10T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 1,
    });

    expect(result.monthExpenseCents).toBe(90_00);
    expect(result.expenseByCategory).toEqual([{ categoryName: "Crédito", expenseCents: 90_00 }]);
    expect(result.incomeExpenseSeries).toEqual([
      { monthLabel: "2026-03", incomeCents: 0, expenseCents: 90_00 },
    ]);
  });

  it("considera só a parcela do mês atual para compras parceladas de cartão", async () => {
    const { repo: dashboardRepo } = makeDashboardRepo({
      monthlyTotals: [{ monthLabel: "2026-03", incomeCents: 0, expenseCents: 0 }],
      expenseByCategory: [],
      creditCardMonthlyExpenses: [{ monthLabel: "2026-03", expenseCents: 30_00 }],
      creditCardExpenseByCategory: [{ categoryName: "Crédito", expenseCents: 30_00 }],
    });
    const { repo: accountsRepo } = makeDashboardAccountsRepo();

    const result = await getHomeDashboard({
      userId: "user-1",
      householdId: "household-1",
      now: new Date("2026-03-10T00:00:00.000Z"),
      dashboardRepo,
      accountsRepo,
      lookbackMonths: 1,
    });

    expect(result.monthExpenseCents).toBe(30_00);
    expect(result.expenseByCategory).toEqual([{ categoryName: "Crédito", expenseCents: 30_00 }]);
    expect(result.incomeExpenseSeries).toEqual([
      { monthLabel: "2026-03", incomeCents: 0, expenseCents: 30_00 },
    ]);
  });
});
