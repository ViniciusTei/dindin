import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { HouseholdContextBar } from "./HouseholdContextBar";

function renderAt(ui: ReactElement, path: string) {
  const router = createMemoryRouter(
    [{ path: "*", element: ui }],
    { initialEntries: [path] },
  );
  return render(<RouterProvider router={router} />);
}

const memberHousehold = { householdId: "hh_1", name: "Casa do João", role: "member" as const };
const adminHousehold = { householdId: "hh_1", name: "Casa do João", role: "admin" as const };

describe("HouseholdContextBar", () => {
  it("renderiza o nome do rateio", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.getByText("Casa do João")).toBeInTheDocument();
  });

  it("nome do rateio é link para /households", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    const link = screen.getByRole("link", { name: /rateio: casa do joão/i });
    expect(link).toHaveAttribute("href", "/households");
  });

  it("tem classe md:hidden na raiz para ocultar no desktop", () => {
    const { container } = renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1",
    );
    expect(container.firstChild).toHaveClass("md:hidden");
  });

  it("marca Visão geral como ativa na rota exata do household", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.getByRole("link", { name: "Visão geral" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca Visão geral como ativa em sub-rota", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/transactions",
    );
    expect(screen.getByRole("link", { name: "Visão geral" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marca Transações como ativa em /households/hh_1/transactions", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/transactions",
    );
    expect(screen.getByRole("link", { name: "Transações" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Categorias como ativa em /households/hh_1/categories", () => {
    renderAt(
      <HouseholdContextBar household={memberHousehold} />,
      "/households/hh_1/categories",
    );
    expect(screen.getByRole("link", { name: "Categorias" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não exibe abas Convites e Membros para membro", () => {
    renderAt(<HouseholdContextBar household={memberHousehold} />, "/households/hh_1");
    expect(screen.queryByRole("link", { name: "Convites" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Membros" })).not.toBeInTheDocument();
  });

  it("exibe abas Convites e Membros para admin", () => {
    renderAt(<HouseholdContextBar household={adminHousehold} />, "/households/hh_1");
    expect(screen.getByRole("link", { name: "Convites" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Membros" })).toBeInTheDocument();
  });

  it("marca Convites como ativa para admin em /households/hh_1/invite", () => {
    renderAt(
      <HouseholdContextBar household={adminHousehold} />,
      "/households/hh_1/invite",
    );
    expect(screen.getByRole("link", { name: "Convites" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Membros como ativa para admin em /households/hh_1/manage", () => {
    renderAt(
      <HouseholdContextBar household={adminHousehold} />,
      "/households/hh_1/manage",
    );
    expect(screen.getByRole("link", { name: "Membros" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
