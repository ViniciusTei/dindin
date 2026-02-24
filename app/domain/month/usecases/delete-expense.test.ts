import { describe, expect, it, vi } from "vitest";

import { deleteExpense } from "./delete-expense";

describe("domain/month/deleteExpense", () => {
  it("falha com EXPENSE_INVALID quando expenseId vazio", async () => {
    const repo = { deleteExpense: vi.fn(async () => undefined) } as any;

    const result = await deleteExpense({ repo, monthId: "m1", expenseId: "" });
    expect(result).toEqual({ ok: false, error: "EXPENSE_INVALID" });
    expect(repo.deleteExpense).not.toHaveBeenCalled();
  });

  it("chama repo.deleteExpense quando ok", async () => {
    const repo = { deleteExpense: vi.fn(async () => undefined) } as any;

    const result = await deleteExpense({ repo, monthId: "m1", expenseId: "e1" });
    expect(result).toEqual({ ok: true });
    expect(repo.deleteExpense).toHaveBeenCalledWith({ monthId: "m1", expenseId: "e1" });
  });
});
