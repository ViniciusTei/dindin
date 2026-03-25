import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Account } from "~/domain/accounts/entity";

import { AccountsPage } from "./AccountsPage";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc_1",
    userId: overrides.userId ?? "user_1",
    name: overrides.name ?? "Banco",
    initialBalanceCents: overrides.initialBalanceCents ?? 0,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

describe("AccountsPage", () => {
  it("mostra estado vazio", () => {
    render(
      <AccountsPage
        accounts={[]}
        totalCurrentBalanceCents={0}
      />
    );

    expect(screen.getByText("Nenhuma conta.")).toBeInTheDocument();
  });

  it("mostra erro e marca input de nome como inválido", () => {
    render(
      <AccountsPage
        accounts={[]}
        totalCurrentBalanceCents={0}
        error="Nome é obrigatório."
      />
    );

    const nameInput = screen.getByLabelText("Nome");
    expect(nameInput).toHaveAttribute("aria-invalid");
    expect(nameInput).toHaveAttribute("aria-describedby", "accounts-error");

    expect(screen.getByRole("alert")).toHaveTextContent("Nome é obrigatório.");
  });

  it("mostra ações de renomear e excluir na lista", () => {
    const account = makeAccount({ name: "Carteira" });

    render(
      <AccountsPage
        accounts={[{ ...account, currentBalanceCents: 0 }]}
        totalCurrentBalanceCents={0}
      />
    );

    expect(screen.getByText("Carteira")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Renomear" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });
});
