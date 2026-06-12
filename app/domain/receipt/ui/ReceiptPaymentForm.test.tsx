import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReceiptPaymentForm } from "./ReceiptPaymentForm";
import type { Account } from "~/domain/accounts/entity";
import type { Category } from "~/domain/categories/entity";
import type { CreditCard } from "~/db/schema";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc-1",
    userId: overrides.userId ?? "user-1",
    name: overrides.name ?? "Conta Corrente",
    initialBalanceCents: overrides.initialBalanceCents ?? 0,
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: overrides.id ?? "cat-1",
    householdId: overrides.householdId ?? "hh-1",
    name: overrides.name ?? "Mercado",
    createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
  };
}

const BASE_PROPS = {
  accounts: [makeAccount()],
  categories: [makeCategory()],
  cards: [] as CreditCard[],
  defaultDate: "2026-03-28",
  defaultNote: "Nota fiscal importada",
  totalCents: 5000,
};

describe("ReceiptPaymentForm", () => {
  it("renderiza as contas no select de conta", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} accounts={[makeAccount({ name: "Nubank" })]} />);

    expect(screen.getByRole("option", { name: "Nubank" })).toBeInTheDocument();
  });

  it("renderiza as categorias no select de categoria", () => {
    render(
      <ReceiptPaymentForm
        {...BASE_PROPS}
        categories={[makeCategory({ name: "Alimentação" })]}
      />,
    );

    expect(screen.getByRole("option", { name: "Alimentação" })).toBeInTheDocument();
  });

  it("pré-preenche o campo de data com defaultDate", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} defaultDate="2026-03-15" />);

    expect(screen.getByDisplayValue("2026-03-15")).toBeInTheDocument();
  });

  it("mostra select de conta por padrão (pagamento por conta)", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} accounts={[makeAccount({ name: "Conta Corrente" })]} />);

    // The account option must be present in an active select
    expect(screen.getByRole("option", { name: "Conta Corrente" })).toBeInTheDocument();
  });

  it("esconde o select de conta e mostra cartões ao selecionar 'Cartão'", () => {
    const cards: CreditCard[] = [
      { id: "card-1", userId: "", nickname: "visa 1234", brand: "visa", closingDay: 10, accountId: "acc-1", numberEnc: null, expirationEnc: null, cvvEnc: null, limitCents: null, dueDay: null, createdAt: new Date() },
    ];

    render(<ReceiptPaymentForm {...BASE_PROPS} cards={cards} />);

    fireEvent.click(screen.getByRole("radio", { name: /cartão/i }));

    expect(screen.queryByRole("combobox", { name: /^conta$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: /VISA.*1234/i })).toBeInTheDocument();
  });

  it("mostra o campo de parcelas quando cartão está selecionado", () => {
    const cards: CreditCard[] = [
      { id: "card-1", userId: "", nickname: "mastercard 5678", brand: "mastercard", closingDay: 10, accountId: null, numberEnc: null, expirationEnc: null, cvvEnc: null, limitCents: null, dueDay: null, createdAt: new Date() },
    ];

    render(<ReceiptPaymentForm {...BASE_PROPS} cards={cards} />);

    fireEvent.click(screen.getByRole("radio", { name: /cartão/i }));

    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("não mostra campo de parcelas no modo conta", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} />);

    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("preenche a textarea de observação com defaultNote", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} defaultNote="Minha nota" />);

    // textarea has no explicit label; query by its default value
    expect(screen.getByDisplayValue("Minha nota")).toBeInTheDocument();
  });

  it("renderiza a opção 'Uma transação' selecionada por padrão", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} />);

    const radio = screen.getByRole("radio", { name: /uma transação/i }) as HTMLInputElement;
    expect(radio.defaultChecked).toBe(true);
  });

  it("renderiza opção 'Por item' no toggle de granularidade", () => {
    render(<ReceiptPaymentForm {...BASE_PROPS} />);

    expect(screen.getByRole("radio", { name: /por item/i })).toBeInTheDocument();
  });
});
