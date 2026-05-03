import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileBottomNav } from "./MobileBottomNav";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" as const },
  { to: "/households", label: "Rateios", icon: "heart" as const },
  { to: "/accounts", label: "Contas", icon: "bank" as const },
  { to: "/cards", label: "Cartões", icon: "credit-card" as const },
  { to: "/settings", label: "Configurações", icon: "settings" as const },
];

describe("MobileBottomNav", () => {
  it("renderiza todos os itens de navegação", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Rateios")).toBeInTheDocument();
    expect(screen.getByLabelText("Contas")).toBeInTheDocument();
    expect(screen.getByLabelText("Cartões")).toBeInTheDocument();
    expect(screen.getByLabelText("Configurações")).toBeInTheDocument();
  });

  it("todos os links apontam para as rotas corretas", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).toHaveAttribute("href", "/");
    expect(screen.getByLabelText("Rateios").closest("a")).toHaveAttribute("href", "/households");
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute("href", "/accounts");
    expect(screen.getByLabelText("Cartões").closest("a")).toHaveAttribute("href", "/cards");
    expect(screen.getByLabelText("Configurações").closest("a")).toHaveAttribute("href", "/settings");
  });

  it("marca Dashboard como ativo na rota raiz /", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca Dashboard como ativo em sub-rotas", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).not.toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Contas como ativo em /accounts", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("marca Contas como ativo em sub-rota /accounts/123", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts/123" />);
    expect(screen.getByLabelText("Contas").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("não marca itens inativos com aria-current", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/accounts" />);
    expect(screen.getByLabelText("Dashboard").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByLabelText("Rateios").closest("a")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renderiza nav com role navigation", () => {
    render(<MobileBottomNav navItems={NAV_ITEMS} currentPath="/" />);
    expect(screen.getByRole("navigation", { name: "Navegação mobile" })).toBeInTheDocument();
  });
});
