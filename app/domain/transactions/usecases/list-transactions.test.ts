import { describe, expect, it, vi } from "vitest";

import type { TransactionsRepo } from "~/domain/transactions/ports";
import { listTransactions } from "./list-transactions";

function makeRepo(): TransactionsRepo {
  return {
    listByHousehold: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

describe("listTransactions", () => {
  it("lista por usuário", async () => {
    const repo = makeRepo();
    await listTransactions({ transactionsRepo: repo, userId: "u1", householdId: "hh1" });
    expect(repo.listByHousehold).toHaveBeenCalledWith({
      userId: "u1",
      householdId: "hh1",
      filters: undefined,
    });
  });

  it("calls listByHousehold without filters when none provided", async () => {
    const repo = makeRepo();
    await listTransactions({ transactionsRepo: repo, userId: "u1", householdId: "hh1" });
    expect(repo.listByHousehold).toHaveBeenCalledWith({
      userId: "u1",
      householdId: "hh1",
      filters: undefined,
    });
  });

  it("passes filters to listByHousehold", async () => {
    const repo = makeRepo();
    await listTransactions({
      transactionsRepo: repo,
      userId: "u1",
      householdId: "hh1",
      filters: { type: "expense" },
    });
    expect(repo.listByHousehold).toHaveBeenCalledWith({
      userId: "u1",
      householdId: "hh1",
      filters: { type: "expense" },
    });
  });
});
