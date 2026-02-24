import { describe, expect, it, vi } from "vitest";

import { makeIdFactory, makeNow } from "~/domain/test/fakes";

import { closeMonth } from "./close-month";

describe("domain/month/closeMonth", () => {
  it("falha com NO_MEMBERS quando não há membros", async () => {
    const repo = {
      listMembers: vi.fn(async () => []),
      listIncomes: vi.fn(async () => []),
      listExpenses: vi.fn(async () => []),
      replaceTransfers: vi.fn(async () => undefined),
      closeMonth: vi.fn(async () => undefined),
    } as any;

    const result = await closeMonth({
      repo,
      idFactory: makeIdFactory(),
      now: makeNow(),
      householdId: "h1",
      monthId: "m1",
    });

    expect(result).toEqual({ ok: false, error: "NO_MEMBERS" });
    expect(repo.replaceTransfers).not.toHaveBeenCalled();
    expect(repo.closeMonth).not.toHaveBeenCalled();
  });

  it("gera transferências e fecha o mês", async () => {
    const repo = {
      listMembers: vi.fn(async () => [
        { userId: "admin", role: "admin", username: "Admin" },
        { userId: "member", role: "member", username: "Member" },
      ]),
      listIncomes: vi.fn(async () => []),
      listExpenses: vi.fn(async () => [{ amountCents: 1000 }]),
      replaceTransfers: vi.fn(async () => undefined),
      closeMonth: vi.fn(async () => undefined),
    } as any;

    const now = makeNow("2026-02-23T12:00:00.000Z");
    const idFactory = makeIdFactory("t");

    const result = await closeMonth({
      repo,
      idFactory,
      now,
      householdId: "h1",
      monthId: "m1",
    });

    expect(result).toEqual({ ok: true });
    expect(repo.replaceTransfers).toHaveBeenCalledWith({
      idFactory: expect.any(Function),
      monthId: "m1",
      transfers: [{ fromUserId: "member", toUserId: "admin", amountCents: 500 }],
    });
    expect(repo.closeMonth).toHaveBeenCalledWith({
      monthId: "m1",
      closedAt: new Date("2026-02-23T12:00:00.000Z"),
    });
  });
});
