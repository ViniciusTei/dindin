import { describe, expect, it } from "vitest";

import { renameAccount } from "~/domain/accounts/usecases/rename-account";
import { makeAccountsRepo } from "~/domain/test/fakes";

describe("renameAccount", () => {
  it("valida nome obrigatório", async () => {
    const { repo } = makeAccountsRepo({ accounts: [{ id: "a1", name: "Carteira" }] });

    const result = await renameAccount({
      accountsRepo: repo,
      userId: "user-1",
      accountId: "a1",
      name: " ",
    });

    expect(result).toEqual({ ok: false, error: "NAME_REQUIRED" });
  });

  it("falha se não existir", async () => {
    const { repo } = makeAccountsRepo();

    const result = await renameAccount({
      accountsRepo: repo,
      userId: "user-1",
      accountId: "missing",
      name: "Banco",
    });

    expect(result).toEqual({ ok: false, error: "NOT_FOUND" });
  });

  it("falha se novo nome já existir", async () => {
    const { repo } = makeAccountsRepo({
      accounts: [
        { id: "a1", name: "Carteira" },
        { id: "a2", name: "Banco" },
      ],
    });

    const result = await renameAccount({
      accountsRepo: repo,
      userId: "user-1",
      accountId: "a1",
      name: "Banco",
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("renomeia", async () => {
    const { repo, accounts } = makeAccountsRepo({ accounts: [{ id: "a1", name: "Carteira" }] });

    const result = await renameAccount({
      accountsRepo: repo,
      userId: "user-1",
      accountId: "a1",
      name: "Carteira 2",
    });

    expect(result).toEqual({ ok: true });
    expect(accounts[0]?.name).toBe("Carteira 2");
  });
});
