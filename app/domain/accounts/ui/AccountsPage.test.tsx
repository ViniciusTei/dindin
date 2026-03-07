import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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

  it("pede confirmação ao excluir conta", () => {
    const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

    const account = makeAccount({ name: "Carteira" });

    render(
      <AccountsPage
        accounts={[{ ...account, currentBalanceCents: 0 }]}
        totalCurrentBalanceCents={0}
      />
    );

    const deleteButton = screen.getByRole("button", { name: "Excluir" });
    const form = deleteButton.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form!);

    expect(confirmMock).toHaveBeenCalledWith('Excluir a conta "Carteira"?');

    confirmMock.mockRestore();
  });
});
