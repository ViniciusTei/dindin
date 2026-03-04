import { describe, expect, it } from "vitest";

import { updateTransaction } from "~/domain/transactions/usecases/update-transaction";
import { makeTransactionsRepo } from "~/domain/test/fakes";

describe("updateTransaction", () => {
  it("falha se não existir", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await updateTransaction({
      transactionsRepo: repo,
      userId: "user-1",
      transactionId: "missing",
      accountId: "a1",
      type: "expense",
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("falha se conta não existir", async () => {
    const { repo } = makeTransactionsRepo({
      accounts: [{ id: "a1" }],
      transactions: [
        {
          id: "t1",
          accountId: "a1",
          type: "expense",
          description: "Mercado",
          amountCents: 100,
        },
      ],
    });

    const result = await updateTransaction({
      transactionsRepo: repo,
      userId: "user-1",
      transactionId: "t1",
      accountId: "missing",
      type: "expense",
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("atualiza", async () => {
    const { repo, transactions } = makeTransactionsRepo({
      accounts: [{ id: "a1" }],
      transactions: [
        {
          id: "t1",
          accountId: "a1",
          type: "expense",
          description: "Mercado",
          amountCents: 100,
        },
      ],
    });

    const result = await updateTransaction({
      transactionsRepo: repo,
      userId: "user-1",
      transactionId: "t1",
      accountId: "a1",
      type: "income",
      description: "Salário",
      amountCents: 999,
      occurredAt: new Date("2026-03-01T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: true });
    expect(transactions[0]?.type).toBe("income");
    expect(transactions[0]?.description).toBe("Salário");
    expect(transactions[0]?.amountCents).toBe(999);
  });
});
