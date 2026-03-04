import { describe, expect, it } from "vitest";

import { listTransactions } from "~/domain/transactions/usecases/list-transactions";
import { makeTransactionsRepo } from "~/domain/test/fakes";

describe("listTransactions", () => {
  it("lista por usuário", async () => {
    const { repo, userId } = makeTransactionsRepo({
      userId: "user-1",
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

    const rows = await listTransactions({ transactionsRepo: repo, userId });

    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe("t1");
  });
});
