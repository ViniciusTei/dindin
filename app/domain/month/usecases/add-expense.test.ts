import { describe, expect, it, vi } from "vitest";

import { makeIdFactory } from "~/domain/test/fakes";

import { addExpense } from "./add-expense";

describe("domain/month/addExpense", () => {
  it("valida description", async () => {
    const repo = { addExpense: vi.fn(async () => undefined) } as any;

    const result = await addExpense({
      repo,
      idFactory: makeIdFactory(),
      monthId: "m1",
      description: " ",
      categoryId: "c1",
      amountCents: 100,
    });

    expect(result).toEqual({ ok: false, error: "DESCRIPTION_REQUIRED" });
    expect(repo.addExpense).not.toHaveBeenCalled();
  });

  it("valida categoryId", async () => {
    const repo = { addExpense: vi.fn(async () => undefined) } as any;

    const result = await addExpense({
      repo,
      idFactory: makeIdFactory(),
      monthId: "m1",
      description: "Mercado",
      categoryId: " ",
      amountCents: 100,
    });

    expect(result).toEqual({ ok: false, error: "CATEGORY_REQUIRED" });
    expect(repo.addExpense).not.toHaveBeenCalled();
  });

  it("valida amountCents", async () => {
    const repo = { addExpense: vi.fn(async () => undefined) } as any;

    const result = await addExpense({
      repo,
      idFactory: makeIdFactory(),
      monthId: "m1",
      description: "Mercado",
      categoryId: "c1",
      amountCents: 0,
    });

    expect(result).toEqual({ ok: false, error: "AMOUNT_INVALID" });
    expect(repo.addExpense).not.toHaveBeenCalled();
  });

  it("chama repo.addExpense quando ok", async () => {
    const repo = { addExpense: vi.fn(async () => undefined) } as any;

    const result = await addExpense({
      repo,
      idFactory: makeIdFactory("exp"),
      monthId: "m1",
      description: " Mercado ",
      categoryId: " c1 ",
      amountCents: 123,
    });

    expect(result).toEqual({ ok: true });
    expect(repo.addExpense).toHaveBeenCalledWith({
      idFactory: expect.any(Function),
      monthId: "m1",
      categoryId: "c1",
      description: "Mercado",
      amountCents: 123,
    });
  });
});
