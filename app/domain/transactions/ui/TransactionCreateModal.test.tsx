import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";

import TransactionCreateModal from "./TransactionCreateModal";

const navigationMock = vi.hoisted(() => ({
  state: "idle" as "idle" | "submitting" | "loading",
  formData: null as FormData | null,
}));

vi.mock("react-router", () => ({
  Form: (props: any) => <form {...props} />,
  useNavigation: () => navigationMock,
}));

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc_1",
    userId: overrides.userId ?? "user_1",
    name: overrides.name ?? "Conta",
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

describe("TransactionCreateModal", () => {
  beforeEach(() => {
    navigationMock.state = "idle";
    navigationMock.formData = null;
  });

  it("desabilita o botão de criar após submit para evitar duplo envio", () => {
    render(
      <TransactionCreateModal
        accounts={[makeAccount()]}
        categories={[makeCategory()]}
        today="2026-03-25"
      />
    );

    const submitButton = screen.getByTestId("transaction-create-submit");
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it("mantém botão desabilitado durante submissão com intent=create", () => {
    const formData = new FormData();
    formData.set("intent", "create");
    navigationMock.state = "submitting";
    navigationMock.formData = formData;

    render(
      <TransactionCreateModal
        accounts={[makeAccount()]}
        categories={[makeCategory()]}
        today="2026-03-25"
      />
    );

    expect(screen.getByTestId("transaction-create-submit")).toBeDisabled();
  });
});
