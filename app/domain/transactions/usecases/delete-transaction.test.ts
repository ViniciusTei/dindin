import { describe, expect, it } from "vitest";

import { deleteTransaction } from "~/domain/transactions/usecases/delete-transaction";
import { makeTransactionsRepo } from "~/domain/test/fakes";

describe("deleteTransaction", () => {
  it("falha se não existir", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await deleteTransaction({
      transactionsRepo: repo,
      userId: "user-1",
      transactionId: "missing",
    });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("exclui", async () => {
    const { repo, transactions } = makeTransactionsRepo({
      accounts: [{ id: "a1" }],
      transactions: [
        {
          id: "t1",
          accountId: "a1",
          categoryId: null,
          type: "expense",
          description: "Mercado",
          amountCents: 100,
        },
      ],
    });

    const result = await deleteTransaction({
      transactionsRepo: repo,
      userId: "user-1",
      transactionId: "t1",
    });

    expect(result).toEqual({ ok: true });
    expect(transactions).toHaveLength(0);
  });
});
