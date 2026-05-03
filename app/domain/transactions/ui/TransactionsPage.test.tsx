import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { Transaction } from "~/domain/transactions/entity";
import { renderWithDataRouter } from "~/domain/test/renderWithDataRouter";
import { TransactionsPage } from "./TransactionsPage";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc_1",
    userId: overrides.userId ?? "user_1",
    name: overrides.name ?? "Banco",
    initialBalanceCents: overrides.initialBalanceCents ?? 0,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: overrides.id ?? "cat_1",
    householdId: overrides.householdId ?? "hh_1",
    name: overrides.name ?? "Mercado",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: overrides.id ?? "tx_1",
    userId: overrides.userId ?? "user_1",
    householdId: overrides.householdId ?? "hh_1",
    accountId: overrides.accountId ?? "acc_1",
    categoryId: overrides.categoryId ?? null,
    type: overrides.type ?? "expense",
    description: overrides.description ?? "Uber",
    amountCents: overrides.amountCents ?? 1234,
    occurredAt: overrides.occurredAt ?? new Date("2026-02-01T00:00:00.000Z"),
    createdAt: overrides.createdAt ?? new Date("2026-02-01T00:00:00.000Z"),
  };
}

describe("TransactionsPage", () => {
  const accounts = [makeAccount()];
  const categories = [makeCategory()];

  it("mostra estado vazio", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[]}
        today="2026-03-04"
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />
    );

    expect(screen.getByText("Nenhuma transação.")).toBeInTheDocument();
  });

  it("mostra erro", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[]}
        today="2026-03-04"
        error="Conta é obrigatória."
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Conta é obrigatória.");
  });

  it("mostra ok", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[]}
        today="2026-03-04"
        ok={true}
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent("Salvo.");
  });

  it("mostra resumo e ações da transação", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[makeTransaction()]}
        today="2026-03-04"
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />
    );

    expect(screen.getByText("Uber")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir transação" })).toBeInTheDocument();
  });

  it("agrupa transações por data", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[
          makeTransaction({ id: "tx_1", occurredAt: new Date("2026-02-01T00:00:00.000Z"), description: "Uber" }),
          makeTransaction({ id: "tx_2", occurredAt: new Date("2026-02-01T00:00:00.000Z"), description: "Lyft" }),
          makeTransaction({ id: "tx_3", occurredAt: new Date("2026-02-05T00:00:00.000Z"), description: "Netflix" }),
        ]}
        today="2026-03-04"
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />,
    );
    expect(screen.getByText("01/02/2026")).toBeInTheDocument();
    expect(screen.getByText("05/02/2026")).toBeInTheDocument();
    expect(screen.getByText("Uber")).toBeInTheDocument();
    expect(screen.getByText("Lyft")).toBeInTheDocument();
    expect(screen.getByText("Netflix")).toBeInTheDocument();
  });

  it("mostra barra de filtros", () => {
    renderWithDataRouter(
      <TransactionsPage
        accounts={accounts}
        categories={categories}
        transactions={[]}
        today="2026-03-04"
        activeFilters={{ type: "", categoryId: "", accountId: "", q: "" }}
      />,
    );
    expect(screen.getByRole("combobox", { name: /tipo/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument();
  });
});
