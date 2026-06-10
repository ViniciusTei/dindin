import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";

import { ThemeProvider } from "~/contexts/ThemeContext";

import { DesktopSidebar } from "./DesktopSidebar";

const DEFAULT_NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: "dashboard" as const },
  { to: "/households", label: "Rateios", icon: "heart" as const },
  { to: "/accounts", label: "Contas", icon: "bank" as const },
  { to: "/cards", label: "Cartões", icon: "credit-card" as const },
  { to: "/settings", label: "Configurações", icon: "settings" as const },
];

function renderSidebar(props: Partial<Parameters<typeof DesktopSidebar>[0]> = {}) {
  const defaultProps = {
    isSidebarCollapsed: false,
    navItems: DEFAULT_NAV_ITEMS,
    currentPath: "/",
    ...props,
  };

  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <ThemeProvider>
            <DesktopSidebar {...defaultProps} />
          </ThemeProvider>
        ),
      },
    ],
    { initialEntries: ["/"] },
  );

  return render(<RouterProvider router={router} />);
}

describe("DesktopSidebar", () => {
  it("renderiza os itens de navegação principais", () => {
    renderSidebar();
    expect(screen.getByLabelText("Dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Contas")).toBeInTheDocument();
    expect(screen.getByLabelText("Cartões")).toBeInTheDocument();
  });

  it("oculta labels quando colapsado", async () => {
    renderSidebar({ isSidebarCollapsed: true });
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Contas")).not.toBeInTheDocument();
  });

  it("mostra labels quando expandido", () => {
    renderSidebar({ isSidebarCollapsed: false });
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Contas")).toBeInTheDocument();
  });

  it("renderiza botão de logout", () => {
    renderSidebar();
    expect(screen.getByTitle("Sair")).toBeInTheDocument();
  });

  it("aplica classe ativa no item de nav correspondente ao caminho atual", () => {
    renderSidebar({ currentPath: "/accounts" });
    const contasLink = screen.getByRole("link", { name: "Contas" });
    expect(contasLink.closest("li")).toHaveClass("active");
  });

  it("aplica active no Dashboard apenas quando path é exato /", () => {
    renderSidebar({ currentPath: "/accounts" });
    const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
    expect(dashboardLink.closest("li")).not.toHaveClass("active");
  });
});
