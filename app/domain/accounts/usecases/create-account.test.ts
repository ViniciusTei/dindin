import { describe, expect, it } from "vitest";

import { createAccount } from "~/domain/accounts/usecases/create-account";
import { makeAccountsRepo, makeIdFactory } from "~/domain/test/fakes";

describe("createAccount", () => {
  it("valida nome obrigatório", async () => {
    const { repo } = makeAccountsRepo();

    const result = await createAccount({
      accountsRepo: repo,
      idFactory: makeIdFactory("acc"),
      userId: "user-1",
      name: "   ",
      initialBalanceCents: 0,
    });

    expect(result).toEqual({ ok: false, error: "NAME_REQUIRED" });
  });

  it("valida saldo inicial inteiro", async () => {
    const { repo } = makeAccountsRepo();

    const result = await createAccount({
      accountsRepo: repo,
      idFactory: makeIdFactory("acc"),
      userId: "user-1",
      name: "Carteira",
      initialBalanceCents: 10.5,
    });

    expect(result).toEqual({ ok: false, error: "INITIAL_BALANCE_INVALID" });
  });

  it("falha se já existir", async () => {
    const { repo } = makeAccountsRepo({ accounts: [{ id: "a1", name: "Carteira" }] });

    const result = await createAccount({
      accountsRepo: repo,
      idFactory: makeIdFactory("acc"),
      userId: "user-1",
      name: "Carteira",
      initialBalanceCents: 0,
    });

    expect(result).toEqual({ ok: false, error: "ALREADY_EXISTS" });
  });

  it("cria e retorna id", async () => {
    const { repo, accounts } = makeAccountsRepo();

    const result = await createAccount({
      accountsRepo: repo,
      idFactory: makeIdFactory("acc"),
      userId: "user-1",
      name: "Carteira",
      initialBalanceCents: 123,
    });

    expect(result.ok).toBe(true);
    expect(accounts).toHaveLength(1);
    expect(accounts[0]?.name).toBe("Carteira");
  });
});
