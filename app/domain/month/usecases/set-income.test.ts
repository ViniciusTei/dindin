import { describe, expect, it, vi } from "vitest";

import { makeIdFactory } from "~/domain/test/fakes";

import { setIncome } from "./set-income";

describe("domain/month/setIncome", () => {
  it("falha com USER_INVALID quando userId vazio", async () => {
    const repo = {
      deleteIncome: vi.fn(async () => undefined),
      upsertIncome: vi.fn(async () => undefined),
    } as any;

    const result = await setIncome({
      repo,
      idFactory: makeIdFactory(),
      monthId: "m1",
      userId: "",
      amountCents: 100,
    });

    expect(result).toEqual({ ok: false, error: "USER_INVALID" });
    expect(repo.upsertIncome).not.toHaveBeenCalled();
  });

  it("deleta renda quando amountCents é null", async () => {
    const repo = {
      deleteIncome: vi.fn(async () => undefined),
      upsertIncome: vi.fn(async () => undefined),
    } as any;

    const result = await setIncome({
      repo,
      idFactory: makeIdFactory(),
      monthId: "m1",
      userId: "u1",
      amountCents: null,
    });

    expect(result).toEqual({ ok: true });
    expect(repo.deleteIncome).toHaveBeenCalledWith({ monthId: "m1", userId: "u1" });
    expect(repo.upsertIncome).not.toHaveBeenCalled();
  });

  it("upsert renda quando amountCents é número", async () => {
    const repo = {
      deleteIncome: vi.fn(async () => undefined),
      upsertIncome: vi.fn(async () => undefined),
    } as any;

    const result = await setIncome({
      repo,
      idFactory: makeIdFactory("inc"),
      monthId: "m1",
      userId: "u1",
      amountCents: 12345,
    });

    expect(result).toEqual({ ok: true });
    expect(repo.upsertIncome).toHaveBeenCalled();
    expect(repo.deleteIncome).not.toHaveBeenCalled();
  });
});
