import { describe, expect, it } from "vitest";

import { deleteAccount } from "~/domain/accounts/usecases/delete-account";
import { makeAccountsRepo } from "~/domain/test/fakes";

describe("deleteAccount", () => {
  it("falha se houver transações", async () => {
    const { repo } = makeAccountsRepo({
      accounts: [{ id: "a1", name: "Carteira" }],
      txCountsByAccountId: { a1: 2 },
    });

    const result = await deleteAccount({ accountsRepo: repo, userId: "user-1", accountId: "a1" });

    expect(result).toEqual({ ok: false, error: "HAS_TRANSACTIONS" });
  });

  it("falha se não existir", async () => {
    const { repo } = makeAccountsRepo();

    const result = await deleteAccount({ accountsRepo: repo, userId: "user-1", accountId: "missing" });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("exclui", async () => {
    const { repo, accounts } = makeAccountsRepo({ accounts: [{ id: "a1", name: "Carteira" }] });

    const result = await deleteAccount({ accountsRepo: repo, userId: "user-1", accountId: "a1" });

    expect(result).toEqual({ ok: true });
    expect(accounts).toHaveLength(0);
  });
});
