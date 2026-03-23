import { describe, expect, it } from "vitest";

import { createTransaction } from "~/domain/transactions/usecases/create-transaction";
import { makeIdFactory, makeTransactionsRepo } from "~/domain/test/fakes";

describe("createTransaction", () => {
  it("valida conta obrigatória", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await createTransaction({
      transactionsRepo: repo,
      idFactory: makeIdFactory("tx"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "",
      categoryId: null,
      type: "expense",
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "ACCOUNT_REQUIRED" });
  });

  it("valida descrição obrigatória", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await createTransaction({
      transactionsRepo: repo,
      idFactory: makeIdFactory("tx"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "a1",
      categoryId: null,
      type: "expense",
      description: "   ",
      amountCents: 100,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "DESCRIPTION_REQUIRED" });
  });

  it("valida valor > 0", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await createTransaction({
      transactionsRepo: repo,
      idFactory: makeIdFactory("tx"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "a1",
      categoryId: null,
      type: "expense",
      description: "Mercado",
      amountCents: 0,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "AMOUNT_INVALID" });
  });

  it("falha se conta não existir", async () => {
    const { repo } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await createTransaction({
      transactionsRepo: repo,
      idFactory: makeIdFactory("tx"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "missing",
      categoryId: null,
      type: "expense",
      description: "Mercado",
      amountCents: 100,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result).toEqual({ ok: false, error: "ACCOUNT_NOT_FOUND" });
  });

  it("cria e retorna id", async () => {
    const { repo, transactions } = makeTransactionsRepo({ accounts: [{ id: "a1" }] });

    const result = await createTransaction({
      transactionsRepo: repo,
      idFactory: makeIdFactory("tx"),
      userId: "user-1",
      householdId: "household-1",
      accountId: "a1",
      categoryId: null,
      type: "expense",
      description: "Mercado",
      amountCents: 123,
      occurredAt: new Date("2026-03-04T00:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
    expect(transactions).toHaveLength(1);
  });
});
