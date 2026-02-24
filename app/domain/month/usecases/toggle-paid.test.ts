import { describe, expect, it, vi } from "vitest";

import { togglePaid } from "./toggle-paid";

describe("domain/month/togglePaid", () => {
  it("falha com EXPENSE_INVALID quando expenseId vazio", async () => {
    const repo = { toggleExpensePaid: vi.fn(async () => undefined) } as any;

    const result = await togglePaid({ repo, monthId: "m1", expenseId: "", isPaid: true });
    expect(result).toEqual({ ok: false, error: "EXPENSE_INVALID" });
    expect(repo.toggleExpensePaid).not.toHaveBeenCalled();
  });

  it("chama repo.toggleExpensePaid quando ok", async () => {
    const repo = { toggleExpensePaid: vi.fn(async () => undefined) } as any;

    const result = await togglePaid({ repo, monthId: "m1", expenseId: "e1", isPaid: true });
    expect(result).toEqual({ ok: true });
    expect(repo.toggleExpensePaid).toHaveBeenCalledWith({
      monthId: "m1",
      expenseId: "e1",
      isPaid: true,
    });
  });
});
